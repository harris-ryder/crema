export const imageMimeTypes = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
};

export function getImageMimeType(extension: string) {
  const normalizedExtension =
    extension.toLowerCase() as keyof typeof imageMimeTypes;
  return imageMimeTypes[normalizedExtension] || "application/octet-stream";
}
