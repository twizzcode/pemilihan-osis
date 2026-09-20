import { ImageIcon, UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Resolves a candidate photo value into a usable image URL.
 *
 * Stored photos are relative paths like "uploads/<file>" and are served
 * through the /api/files route. Preview URLs (blob:), data URLs, and other
 * absolute URLs (http/https, leading "/") are used as-is.
 */
function resolvePhotoSrc(src: string): string {
  if (
    src.startsWith("blob:") ||
    src.startsWith("data:") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }
  return `/api/files/${src}`;
}

export function CandidatePhoto({
  src,
  alt,
  className,
  compact = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-muted to-chart-2/20",
        compact && "rounded-lg",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvePhotoSrc(src)}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
          {compact ? (
            <UserRoundIcon className="size-5 opacity-60" />
          ) : (
            <>
              <ImageIcon className="size-10 opacity-50" />
              <span className="text-xs">Foto belum tersedia</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
