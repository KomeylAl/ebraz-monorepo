import type { ListPaymentsQuery, UpdatePaymentInput } from "@ebraz/validation/payments";
import { PaymentError } from "../domain/payments.errors";
import { toPaymentProfile } from "../domain/payment.mapper";
import {
  findPaymentById,
  listPayments,
  updatePaymentRecord,
} from "../infrastructure/payments.repository";

export async function getPayments(query: ListPaymentsQuery) {
  return listPayments(query);
}

export async function getPaymentById(id: string) {
  const payment = await findPaymentById(id);
  if (!payment) throw new PaymentError("Payment not found", "NOT_FOUND");
  return toPaymentProfile(payment);
}

export async function updatePayment(id: string, input: UpdatePaymentInput, actorId: string) {
  const existing = await findPaymentById(id);
  if (!existing) throw new PaymentError("Payment not found", "NOT_FOUND");
  return updatePaymentRecord(id, input, actorId, existing);
}
