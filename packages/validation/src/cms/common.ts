import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1, "اسلاگ الزامی است")
  .regex(
    /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/,
    "اسلاگ معتبر نیست",
  );

export const cmsContentFields = {
  excerpt: z.string().optional(),
  content: z.string().min(1, "محتوا الزامی است"),
  image: z.string().optional(),
};

export const postStatusSchema = z.enum(["draft", "published", "archived"]);
