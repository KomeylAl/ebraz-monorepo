import { z } from "zod";
import { paginationSchema } from "../common/index";
import { cmsContentFields, slugSchema } from "./common";

export const createTagSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  slug: slugSchema,
  ...cmsContentFields,
});

export const updateTagSchema = z
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

export const listTagsQuerySchema = paginationSchema;

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;
