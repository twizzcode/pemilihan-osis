/**
 * Shared photo upload rules, safe to import from both client and server code.
 */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const PHOTO_ACCEPT = "image/png,image/jpeg,image/webp";
export const PHOTO_ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
export const PHOTO_MAX_BYTES_LABEL = "5MB";

/**
 * Returns a user-friendly error message when the file fails validation,
 * or null when it is acceptable.
 */
export function validatePhotoFile(file: File): string | null {
  if (!PHOTO_ALLOWED_TYPES.has(file.type)) {
    return "Format foto harus JPG, PNG, atau WEBP.";
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return `Ukuran foto maksimal ${PHOTO_MAX_BYTES_LABEL}.`;
  }
  return null;
}
