import { z } from "zod";
import { paginationSchema } from "../common/index";
import { postStatusSchema, slugSchema } from "./common";

export const createPostSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: slugSchema,
  content: z.string().min(1, "محتوا الزامی است"),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  status: postStatusSchema.optional(),
  publishedAt: z.coerce.date({ invalid_type_error: "تاریخ انتشار معتبر نیست" }).optional(),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
  tagIds: z.array(z.string().min(1)).optional(),
});

export const updatePostSchema = z
  .object({
    title: z.string().min(1, "عنوان الزامی است").optional(),
    slug: slugSchema.optional(),
    content: z.string().min(1, "محتوا الزامی است").optional(),
    excerpt: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    status: postStatusSchema.optional(),
    publishedAt: z.coerce
      .date({ invalid_type_error: "تاریخ انتشار معتبر نیست" })
      .nullable()
      .optional(),
    categoryId: z.string().min(1).nullable().optional(),
    tagIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listPostsQuerySchema = paginationSchema.extend({
  status: postStatusSchema.optional(),
  categoryId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
