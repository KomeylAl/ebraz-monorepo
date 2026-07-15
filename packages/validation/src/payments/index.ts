import { z } from "zod";
import { paginationSchema } from "../common/index";

const paymentStatusSchema = z.enum(["pending", "paid", "unpaid"]);

export const listPaymentsQuerySchema = paginationSchema.extend({
  status: paymentStatusSchema.optional(),
  clientId: z.string().optional(),
  therapistId: z.string().optional(),
  fromDate: z.coerce.date({ invalid_type_error: "تاریخ شروع معتبر نیست" }).optional(),
  toDate: z.coerce.date({ invalid_type_error: "تاریخ پایان معتبر نیست" }).optional(),
});

export const updatePaymentSchema = z
  .object({
    status: paymentStatusSchema.optional(),
    amount: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "حداقل یک فیلد برای ویرایش الزامی است",
  });

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "مراجع الزامی است"),
  fromDate: z.coerce.date({ invalid_type_error: "تاریخ شروع معتبر نیست" }),
  toDate: z.coerce.date({ invalid_type_error: "تاریخ پایان معتبر نیست" }),
});

export const listInvoicesQuerySchema = paginationSchema.extend({
  clientId: z.string().optional(),
});

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
