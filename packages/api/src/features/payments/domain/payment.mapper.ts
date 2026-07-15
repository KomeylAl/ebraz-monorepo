import type { Prisma } from "@ebraz/database";
import type { PaymentListItem, PaymentProfile } from "@ebraz/types/payments";
import { toISODate } from "@ebraz/utils/date";

export const paymentInclude = {
  appointment: {
    include: {
      client: { select: { id: true, name: true, phone: true } },
      therapist: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.PaymentInclude;

type PaymentRecord = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;

export function toPaymentListItem(payment: PaymentRecord): PaymentListItem {
  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    appointmentId: payment.appointment.id,
    appointmentDate: toISODate(payment.appointment.date),
    appointmentTime: payment.appointment.time,
    client: payment.appointment.client,
    therapist: payment.appointment.therapist,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export function toPaymentProfile(payment: PaymentRecord): PaymentProfile {
  return toPaymentListItem(payment);
}
