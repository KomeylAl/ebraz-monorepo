import type { UploadCategory } from "@ebraz/validation/uploads";

export interface UploadCategoryConfig {
  folder: string;
  maxBytes: number;
  mimeTypes: string[];
  requiresSubfolder?: boolean;
}

export const UPLOAD_CATEGORIES: Record<UploadCategory, UploadCategoryConfig> = {
  therapist_avatar: {
    folder: "doctor_avatars",
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  therapist_resume_pdf: {
    folder: "doctor_resumes",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["application/pdf"],
  },
  post_image: {
    folder: "posts_images",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  category_image: {
    folder: "blog_category_images",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  tag_image: {
    folder: "blog_tag_images",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  department_image: {
    folder: "department_images",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  workshop_image: {
    folder: "workshop_images",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  about_logo: {
    folder: "pictures",
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  invoice_pdf: {
    folder: "pdf",
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["application/pdf"],
  },
  medical_record_image: {
    folder: "medical_records",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    requiresSubfolder: true,
  },
  assessment_file: {
    folder: "assessments",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  resource_file: {
    folder: "therapist_resources",
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export function resolveExtension(mimeType: string, originalName: string): string {
  const fromMime = MIME_EXTENSIONS[mimeType];
  if (fromMime) return fromMime;

  const parts = originalName.split(".");
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  return ext && /^[a-z0-9]+$/.test(ext) ? ext : "bin";
}
