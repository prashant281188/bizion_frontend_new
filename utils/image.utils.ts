const s3Base = process.env.NEXT_PUBLIC_S3_BUCKET_ENDPOINT ?? "";

/**
 * Converts an S3 object key to a full URL using NEXT_PUBLIC_S3_BUCKET_ENDPOINT.
 * Returns empty string if key is falsy.
 */
export function getS3Url(key: string | null | undefined): string {
  return key ? `${s3Base}/${key}` : "";
}

/**
 * Resolves a product/catalog image path to a full URL.
 * If the path is already an absolute URL it is returned as-is;
 * otherwise it is prefixed with the API base URL.
 */
export function resolveApiImageUrl(path: string, apiBase: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${apiBase}/${path}`;
}
