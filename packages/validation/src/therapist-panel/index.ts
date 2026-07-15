import { z } from "zod";
import { optionalDateQuerySchema, paginationSchema, passwordSchema, phoneSchema } from "../common/index";

const resumeEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
});

const resumeExperienceSchema = z.object({
  role: z.string(),
  organization: z.string(),
  from: z.string(),
  to: z.string(),
});

const resumeSocialLinksSchema = z.object({
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  twitter: z.string().optional(),
});

export const upsertTherapistResumeSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  educations: z.array(resumeEducationSchema).optional(),
  experiences: z.array(resumeExperienceSchema).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  content: z.string().optional(),
  socialLinks: resumeSocialLinksSchema.optional(),
  filePath: z.string().optional(),
});

export const therapistResourceTypeSchema = z.enum(["link", "file"]);

export const createTherapistResourceSchema = z
  .object({
    title: z.string().min(1, "عنوان الزامی است"),
    type: therapistResourceTypeSchema,
    description: z.string().optional(),
    link: z.string().optional(),
    filePath: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "link" && !data.link?.trim()) {
      ctx.addIssue({ code: "custom", message: "لینک الزامی است", path: ["link"] });
    }
    if (data.type === "file" && !data.filePath?.trim()) {
      ctx.addIssue({ code: "custom", message: "مسیر فایل الزامی است", path: ["filePath"] });
    }
  });

export const updateTherapistResourceSchema = z
  .object({
    title: z.string().min(1).optional(),
    type: therapistResourceTypeSchema.optional(),
    description: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    filePath: z.string().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listTherapistPanelQuerySchema = paginationSchema.extend({
  date: optionalDateQuerySchema,
});

export const updateTherapistMeSchema = z
  .object({
    name: z.string().min(2, "نام الزامی است").optional(),
    phone: phoneSchema.optional(),
    email: z.string().email("ایمیل معتبر نیست").nullable().optional(),
    times: z.string().nullable().optional(),
    days: z.string().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const changeTherapistPasswordSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "کد تایید باید ۶ رقم باشد"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type UpsertTherapistResumeInput = z.infer<typeof upsertTherapistResumeSchema>;
export type CreateTherapistResourceInput = z.infer<typeof createTherapistResourceSchema>;
export type UpdateTherapistResourceInput = z.infer<typeof updateTherapistResourceSchema>;
export type ListTherapistPanelQuery = z.infer<typeof listTherapistPanelQuerySchema>;
export type UpdateTherapistMeInput = z.infer<typeof updateTherapistMeSchema>;
export type ChangeTherapistPasswordInput = z.infer<typeof changeTherapistPasswordSchema>;
