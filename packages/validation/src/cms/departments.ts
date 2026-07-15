import { z } from "zod";
import { paginationSchema } from "../common/index";
import { slugSchema } from "./common";

export const createDepartmentSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: slugSchema,
  content: z.string().min(1, "محتوا الزامی است"),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  therapistIds: z.array(z.string().min(1)).optional(),
});

export const updateDepartmentSchema = z
  .object({
    title: z.string().min(1, "عنوان الزامی است").optional(),
    slug: slugSchema.optional(),
    content: z.string().min(1, "محتوا الزامی است").optional(),
    excerpt: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    therapistIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listDepartmentsQuerySchema = paginationSchema;

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListDepartmentsQuery = z.infer<typeof listDepartmentsQuerySchema>;
