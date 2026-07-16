import { normalizeAssetPath } from "@ebraz/bff";

export function normalizeImageUrl(value: unknown): string | null {
  const source = normalizeAssetPath(value);
  if (!source) return null;

  if (source.startsWith("data:") || source.startsWith("blob:")) {
    return source;
  }

  if (source.startsWith("//")) {
    return `https:${source}`;
  }

  if (source.startsWith("/")) {
    return source;
  }

  try {
    const url = new URL(source);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // Fall through and normalize legacy relative paths.
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?\//i.test(source)) {
    return `http://${source}`;
  }

  return null;
}
