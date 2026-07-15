import { z } from "zod";
import { paginationSchema, passwordSchema, phoneSchema } from "../common/index";

export const createClientSchema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  phone: phoneSchema,
  birthDate: z.coerce
    .date({ invalid_type_error: "تاریخ تولد معتبر نیست" })
    .optional(),
  address: z.string().optional(),
  password: passwordSchema.optional(),
});

export const updateClientSchema = z
  .object({
    name: z.string().min(2, "نام الزامی است").optional(),
    phone: phoneSchema.optional(),
    birthDate: z.coerce
      .date({ invalid_type_error: "تاریخ تولد معتبر نیست" })
      .nullable()
      .optional(),
    address: z.string().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const setClientPasswordSchema = z.object({
  password: passwordSchema,
});

export const listClientsQuerySchema = paginationSchema;

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type SetClientPasswordInput = z.infer<typeof setClientPasswordSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
