import { z } from "zod";
import { paginationSchema, passwordSchema, phoneSchema } from "../common/index";

const nationalCodeSchema = z
  .string()
  .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد");

const cardNumberSchema = z
  .string()
  .min(16, "شماره کارت معتبر نیست")
  .max(19, "شماره کارت معتبر نیست");

const therapistBaseFields = {
  name: z.string().min(2, "نام الزامی است"),
  phone: phoneSchema,
  nationalCode: nationalCodeSchema,
  birthDate: z.coerce.date({ invalid_type_error: "تاریخ تولد معتبر نیست" }),
  cardNumber: cardNumberSchema,
  medicalNumber: z.string().min(1).optional(),
  email: z.string().email("ایمیل معتبر نیست").optional(),
  avatar: z.string().optional(),
  times: z.string().optional(),
  days: z.string().optional(),
  resume: z.string().optional(),
  profilePath: z.string().optional(),
};

export const createTherapistSchema = z.object({
  ...therapistBaseFields,
  password: passwordSchema.optional(),
});

export const updateTherapistSchema = z
  .object({
    name: therapistBaseFields.name.optional(),
    phone: therapistBaseFields.phone.optional(),
    nationalCode: therapistBaseFields.nationalCode.optional(),
    birthDate: therapistBaseFields.birthDate.optional(),
    cardNumber: therapistBaseFields.cardNumber.optional(),
    medicalNumber: therapistBaseFields.medicalNumber.nullable().optional(),
    email: therapistBaseFields.email.nullable().optional(),
    avatar: therapistBaseFields.avatar.nullable().optional(),
    times: therapistBaseFields.times.nullable().optional(),
    days: therapistBaseFields.days.nullable().optional(),
    resume: therapistBaseFields.resume.nullable().optional(),
    profilePath: therapistBaseFields.profilePath.nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const setTherapistPasswordSchema = z.object({
  password: passwordSchema,
});

export const listTherapistsQuerySchema = paginationSchema;

export const reorderTherapistsSchema = z.object({
  orderedIds: z
    .array(z.string().min(1))
    .min(1, "حداقل یک درمانگر الزامی است")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "شناسه‌های درمانگر باید یکتا باشند",
    }),
});

export type CreateTherapistInput = z.infer<typeof createTherapistSchema>;
export type UpdateTherapistInput = z.infer<typeof updateTherapistSchema>;
export type SetTherapistPasswordInput = z.infer<typeof setTherapistPasswordSchema>;
export type ListTherapistsQuery = z.infer<typeof listTherapistsQuerySchema>;
export type ReorderTherapistsInput = z.infer<typeof reorderTherapistsSchema>;
