import { z } from "zod";
import { paginationSchema, passwordSchema, phoneSchema } from "../common/index";

export const adminSubRoleSchema = z.enum([
  "boss",
  "receptionist",
  "manager",
  "author",
  "accountant",
]);

export const createAdminSchema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  phone: phoneSchema,
  subRole: adminSubRoleSchema,
  birthDate: z.coerce.date({ invalid_type_error: "تاریخ تولد معتبر نیست" }),
  password: passwordSchema,
});

export const updateAdminSchema = z
  .object({
    name: z.string().min(2, "نام الزامی است").optional(),
    phone: phoneSchema.optional(),
    subRole: adminSubRoleSchema.optional(),
    birthDate: z.coerce
      .date({ invalid_type_error: "تاریخ تولد معتبر نیست" })
      .optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listAdminsQuerySchema = paginationSchema.extend({
  subRole: adminSubRoleSchema.optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type ListAdminsQuery = z.infer<typeof listAdminsQuerySchema>;
