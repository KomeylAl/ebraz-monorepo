import { z } from "zod";
import { emptyToUndefined, optionalDateQuerySchema, paginationSchema } from "../common/index";

export const appointmentStatusSchema = z.enum(["pending", "done"]);
export const paymentStatusSchema = z.enum(["pending", "paid", "unpaid"]);

export const createAppointmentSchema = z.object({
  therapistId: z.string().min(1, "انتخاب درمانگر الزامی است"),
  clientId: z.string().min(1, "انتخاب مراجع الزامی است"),
  date: z.coerce.date({ invalid_type_error: "تاریخ معتبر نیست" }),
  time: z.string().min(1, "زمان الزامی است"),
  amount: z.coerce.number().int().min(0, "مبلغ باید عدد مثبت باشد"),
  status: appointmentStatusSchema,
  paymentStatus: paymentStatusSchema,
});

export const updateAppointmentSchema = z
  .object({
    therapistId: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    date: z.coerce.date({ invalid_type_error: "تاریخ معتبر نیست" }).optional(),
    time: z.string().min(1).optional(),
    amount: z.coerce.number().int().min(0).optional(),
    status: appointmentStatusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const listAppointmentsQuerySchema = paginationSchema.extend({
  date: optionalDateQuerySchema,
  clientId: emptyToUndefined(z.string().optional()),
  therapistId: emptyToUndefined(z.string().optional()),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

export function resolvePaymentAmount(
  appointmentAmount: number,
  paymentStatus: "pending" | "paid" | "unpaid",
): number {
  return paymentStatus === "unpaid" ? 0 : appointmentAmount;
}
