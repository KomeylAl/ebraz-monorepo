import { z } from "zod";
import { paginationSchema, phoneSchema } from "../common/index";
import { slugSchema } from "../cms/common";

export const genderSchema = z.enum(["male", "female"]);

export const createWorkshopSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: slugSchema,
  content: z.string().min(1, "محتوا الزامی است"),
  excerpt: z.string().optional(),
  organizers: z.string().optional(),
  startDate: z.coerce.date({ invalid_type_error: "تاریخ شروع معتبر نیست" }).optional(),
  endDate: z.coerce.date({ invalid_type_error: "تاریخ پایان معتبر نیست" }).optional(),
  weekDay: z.string().optional(),
  time: z.string().optional(),
  imgPath: z.string().optional(),
});

export const updateWorkshopSchema = z
  .object({
    title: z.string().min(1, "عنوان الزامی است").optional(),
    slug: slugSchema.optional(),
    content: z.string().min(1, "محتوا الزامی است").optional(),
    excerpt: z.string().nullable().optional(),
    organizers: z.string().nullable().optional(),
    startDate: z.coerce
      .date({ invalid_type_error: "تاریخ شروع معتبر نیست" })
      .nullable()
      .optional(),
    endDate: z.coerce
      .date({ invalid_type_error: "تاریخ پایان معتبر نیست" })
      .nullable()
      .optional(),
    weekDay: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    imgPath: z.string().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const createWorkshopSessionSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  sessionDate: z.coerce.date({ invalid_type_error: "تاریخ جلسه معتبر نیست" }),
  startTime: z.string().min(1, "زمان شروع الزامی است"),
  endTime: z.string().min(1, "زمان پایان الزامی است"),
  location: z.string().optional(),
  link: z.string().optional(),
});

export const updateWorkshopSessionSchema = z
  .object({
    title: z.string().min(1, "عنوان الزامی است").optional(),
    description: z.string().min(1, "توضیحات الزامی است").optional(),
    sessionDate: z.coerce
      .date({ invalid_type_error: "تاریخ جلسه معتبر نیست" })
      .optional(),
    startTime: z.string().min(1, "زمان شروع الزامی است").optional(),
    endTime: z.string().min(1, "زمان پایان الزامی است").optional(),
    location: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

const nationalCodeSchema = z
  .string()
  .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد");

export const participantInputSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  nameEn: z.string().optional(),
  nationalCode: nationalCodeSchema.optional(),
  phone: phoneSchema,
  gender: genderSchema,
  approved: z.boolean().optional(),
});

export const registerWorkshopSchema = participantInputSchema;

export const updateParticipantSchema = z
  .object({
    name: z.string().min(1, "نام الزامی است").optional(),
    nameEn: z.string().nullable().optional(),
    nationalCode: nationalCodeSchema.nullable().optional(),
    phone: phoneSchema.optional(),
    gender: genderSchema.optional(),
    approved: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listWorkshopsQuerySchema = paginationSchema;

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
export type CreateWorkshopSessionInput = z.infer<typeof createWorkshopSessionSchema>;
export type UpdateWorkshopSessionInput = z.infer<typeof updateWorkshopSessionSchema>;
export type ParticipantInput = z.infer<typeof participantInputSchema>;
export type RegisterWorkshopInput = z.infer<typeof registerWorkshopSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type ListWorkshopsQuery = z.infer<typeof listWorkshopsQuerySchema>;
