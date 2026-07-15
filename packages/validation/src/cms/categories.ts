import { z } from "zod";
import { paginationSchema } from "../common/index";
import { cmsContentFields, postStatusSchema, slugSchema } from "./common";

export const createCategorySchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  slug: slugSchema,
  ...cmsContentFields,
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1, "نام الزامی است").optional(),
    slug: slugSchema.optional(),
    excerpt: cmsContentFields.excerpt.nullable().optional(),
    content: cmsContentFields.content.optional(),
    image: cmsContentFields.image.nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listCategoriesQuerySchema = paginationSchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
