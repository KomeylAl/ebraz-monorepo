const LEGACY_UPLOAD_FOLDERS = new Set([
  "doctor_avatars",
  "doctor_resumes",
  "posts_images",
  "post_images",
  "post_tag_images",
  "blog_category_images",
  "blog_tag_images",
  "department_images",
  "workshop_images",
  "pictures",
  "medical_records",
  "assessments",
  "therapist_resources",
  "pdf",
]);

/**
 * Converts legacy database paths to the canonical API upload path.
 * Absolute remote URLs and app-owned static assets are left unchanged.
 */
export function normalizeAssetPath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const source = value.trim().replace(/\\/g, "/");
  if (!source) return null;

  if (
    source.startsWith("data:") ||
    source.startsWith("blob:") ||
    /^https?:\/\//i.test(source)
  ) {
    return source;
  }

  const withoutLeadingSlash = source.replace(/^\/+/, "");
  const withoutStorage = withoutLeadingSlash.replace(/^storage\/+/, "");
  const withoutUploads = withoutStorage.replace(/^uploads\/+/, "");
  const firstSegment = withoutUploads.split("/")[0];

  if (
    withoutLeadingSlash.startsWith("storage/") ||
    withoutLeadingSlash.startsWith("uploads/") ||
    (firstSegment && LEGACY_UPLOAD_FOLDERS.has(firstSegment))
  ) {
    return `/uploads/${withoutUploads}`;
  }

  return source;
}
