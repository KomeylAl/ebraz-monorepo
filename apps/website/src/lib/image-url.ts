const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

export function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const source = value.trim().replace(/\\/g, "/");
  if (!source) return null;

  if (source.startsWith("data:") || source.startsWith("blob:")) {
    return source;
  }

  if (source.startsWith("/uploads/")) {
    return `${API_BASE}${source}`;
  }

  if (source.startsWith("uploads/")) {
    return `${API_BASE}/${source}`;
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

  // Legacy data may contain paths without a leading slash.
  return `/${source.replace(/^\.?\//, "")}`;
}
