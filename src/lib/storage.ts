import "server-only";

import { randomUUID } from "node:crypto";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ensureStorageDir } from "@/lib/db";
import { PHOTO_MAX_BYTES, PHOTO_ALLOWED_TYPES } from "@/lib/photo";

// Output settings for the optimized WebP version.
const WEBP_QUALITY = 82;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1067; // keeps a ~3:4 portrait without upscaling

export type UploadResult = { path: string };

/**
 * Validates, optimizes, and saves an uploaded candidate photo.
 *
 * The image is re-encoded to WebP (resized to fit a 3:4 portrait frame and
 * stripped of metadata) and written to local storage. Returns the relative
 * path stored in the database (e.g. "uploads/abc.webp").
 *
 * Throws an Error with a user-friendly message when the file is invalid; the
 * server action converts it into a toast on the client.
 */
export async function savePhoto(file: File): Promise<UploadResult> {
  if (!PHOTO_ALLOWED_TYPES.has(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WEBP.");
  }
  if (file.size > PHOTO_MAX_BYTES) {
    throw new Error("Ukuran foto maksimal 5MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());

  let optimized: Buffer;
  try {
    optimized = await sharp(input)
      .rotate() // respect EXIF orientation
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new Error("Foto tidak dapat diproses. Coba file lain.");
  }

  const uploadsDir = ensureStorageDir();
  const filename = `${randomUUID()}.webp`;
  await writeFile(
    path.join(/* turbopackIgnore: true */ uploadsDir, filename),
    optimized,
  );
  return { path: `uploads/${filename}` };
}

export async function deletePhoto(relativePath: string | null | undefined) {
  if (!relativePath) return;
  const uploadsDir = ensureStorageDir();
  const filename = relativePath.replace(/^uploads\//, "");
  const target = path.join(/* turbopackIgnore: true */ uploadsDir, filename);
  // Prevent path traversal.
  if (!target.startsWith(uploadsDir)) return;
  await unlink(target).catch(() => {});
}
