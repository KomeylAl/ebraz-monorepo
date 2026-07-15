import { z } from "zod";
import { paginationSchema, phoneSchema } from "../common/index";

export const assessmentStatusSchema = z.enum(["pending", "done"]);

const assessmentClientSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  phone: phoneSchema,
});

export const createPublicAssessmentSchema = z.object({
  client: assessmentClientSchema,
  therapistId: z.string().min(1).nullish(),
  date: z.coerce.date({ invalid_type_error: "تاریخ معتبر نیست" }).optional(),
  time: z.string().optional(),
  status: assessmentStatusSchema.optional(),
});

export const updateAssessmentSchema = z
  .object({
    therapistId: z.string().min(1).nullable().optional(),
    date: z.coerce
      .date({ invalid_type_error: "تاریخ معتبر نیست" })
      .nullable()
      .optional(),
    time: z.string().nullable().optional(),
    status: assessmentStatusSchema.optional(),
    filePath: z.string().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listAssessmentsQuerySchema = paginationSchema.extend({
  status: assessmentStatusSchema.optional(),
  clientId: z.string().optional(),
  therapistId: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional(),
});

export type CreatePublicAssessmentInput = z.infer<typeof createPublicAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type ListAssessmentsQuery = z.infer<typeof listAssessmentsQuerySchema>;
