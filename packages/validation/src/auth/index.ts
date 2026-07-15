import { z } from "zod";
import { passwordSchema, phoneSchema } from "../common/index";

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  phone: phoneSchema,
  password: passwordSchema,
  birthDate: z.coerce.date().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
