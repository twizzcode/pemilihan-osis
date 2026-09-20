import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { ensureStorageDir } from "@/lib/db";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const uploadsDir = ensureStorageDir();
  // Stored paths look like "uploads/<file>"; drop the leading segment if present.
  const rel = segments[0] === "uploads" ? segments.slice(1) : segments;
  const target = path.join(/* turbopackIgnore: true */ uploadsDir, ...rel);

  // Prevent path traversal outside the uploads directory.
  if (!target.startsWith(uploadsDir)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(target);
    if (!info.isFile()) throw new Error("not a file");

    const ext = path.extname(target).toLowerCase();
    const stream = Readable.toWeb(
      createReadStream(target),
    ) as unknown as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
