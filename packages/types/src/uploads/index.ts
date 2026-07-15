export type UploadCategory =
  | "therapist_avatar"
  | "therapist_resume_pdf"
  | "post_image"
  | "category_image"
  | "tag_image"
  | "department_image"
  | "workshop_image"
  | "about_logo"
  | "invoice_pdf"
  | "medical_record_image"
  | "assessment_file"
  | "resource_file";

export interface UploadResult {
  path: string;
  filename: string;
  size: number;
  mimeType: string;
  category: UploadCategory;
}
