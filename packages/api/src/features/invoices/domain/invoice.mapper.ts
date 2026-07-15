import type { Prisma } from "@ebraz/database";
import type { InvoiceLineItem, InvoiceListItem, InvoiceProfile } from "@ebraz/types/payments";
import { toISODate } from "@ebraz/utils/date";

type AppointmentForInvoice = Prisma.AppointmentGetPayload<{
  include: {
    therapist: { select: { name: true } };
    payment: true;
  };
}>;

export function buildLineItems(appointments: AppointmentForInvoice[]): InvoiceLineItem[] {
  return appointments.map((a) => ({
    appointmentId: a.id,
    date: toISODate(a.date),
    time: a.time,
    amount: a.payment?.amount ?? a.amount,
    paymentStatus: a.payment?.status ?? "pending",
    therapistName: a.therapist.name,
  }));
}

export function calculateTotal(appointments: AppointmentForInvoice[]) {
  return appointments.reduce((sum, a) => sum + (a.payment?.amount ?? a.amount), 0);
}

export function toInvoiceListItem(
  invoice: Prisma.InvoiceGetPayload<{ include: { client: { select: { name: true } } } }>,
): InvoiceListItem {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    clientName: invoice.client.name,
    fromDate: toISODate(invoice.fromDate),
    toDate: toISODate(invoice.toDate),
    totalAmount: invoice.totalAmount,
    filePath: invoice.filePath,
    createdAt: invoice.createdAt.toISOString(),
  };
}

export function toInvoiceProfile(
  invoice: Prisma.InvoiceGetPayload<{ include: { client: { select: { name: true } } } }>,
  lineItems: InvoiceLineItem[],
): InvoiceProfile {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    clientName: invoice.client.name,
    adminId: invoice.adminId,
    fromDate: toISODate(invoice.fromDate),
    toDate: toISODate(invoice.toDate),
    filePath: invoice.filePath,
    totalAmount: invoice.totalAmount,
    lineItems,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}
