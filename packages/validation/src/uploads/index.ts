import { z } from "zod";

export const uploadCategorySchema = z.enum([
  "therapist_avatar",
  "therapist_resume_pdf",
  "post_image",
  "category_image",
  "tag_image",
  "department_image",
  "workshop_image",
  "about_logo",
  "invoice_pdf",
  "medical_record_image",
  "assessment_file",
  "resource_file",
]);

export type UploadCategory = z.infer<typeof uploadCategorySchema>;

export const uploadFormSchema = z.object({
  category: uploadCategorySchema,
  subfolder: z.string().min(1).optional(),
});

export type UploadFormInput = z.infer<typeof uploadFormSchema>;
