import { prisma } from "@ebraz/database";
import type { CreateInvoiceInput, ListInvoicesQuery } from "@ebraz/validation/payments";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import {
  buildLineItems,
  calculateTotal,
  toInvoiceListItem,
  toInvoiceProfile,
} from "../domain/invoice.mapper";

const invoiceListInclude = {
  client: { select: { name: true } },
} as const;

export async function listInvoices(query: ListInvoicesQuery) {
  const where = {
    deletedAt: null,
    ...(query.clientId ? { clientId: query.clientId } : {}),
  };
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: invoiceListInclude,
    }),
    prisma.invoice.count({ where }),
  ]);
  return {
    data: items.map(toInvoiceListItem),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findInvoiceById(id: string) {
  return prisma.invoice.findFirst({
    where: { id, deletedAt: null },
    include: invoiceListInclude,
  });
}

export async function findClientById(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

async function findAppointmentsForInvoice(
  clientId: string,
  fromDate: Date,
  toDate: Date,
) {
  return prisma.appointment.findMany({
    where: {
      clientId,
      deletedAt: null,
      date: { gte: fromDate, lte: toDate },
    },
    include: {
      therapist: { select: { name: true } },
      payment: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

export async function createInvoiceRecord(
  input: CreateInvoiceInput,
  adminId: string,
  actorId: string,
) {
  const appointments = await findAppointmentsForInvoice(
    input.clientId,
    input.fromDate,
    input.toDate,
  );
  if (appointments.length === 0) {
    return null;
  }

  const lineItems = buildLineItems(appointments);
  const totalAmount = calculateTotal(appointments);
  const invoice = await prisma.invoice.create({
    data: {
      clientId: input.clientId,
      adminId,
      fromDate: input.fromDate,
      toDate: input.toDate,
      totalAmount,
      filePath: `/uploads/pdf/invoice-pending.pdf`,
      createdBy: actorId,
      updatedBy: actorId,
    },
    include: invoiceListInclude,
  });

  const filePath = `/uploads/pdf/invoice-${invoice.id}.pdf`;
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { filePath },
    include: invoiceListInclude,
  });

  return toInvoiceProfile(updated, lineItems);
}

export async function getInvoiceWithLineItems(id: string) {
  const invoice = await findInvoiceById(id);
  if (!invoice) return null;

  const appointments = await findAppointmentsForInvoice(
    invoice.clientId,
    invoice.fromDate,
    invoice.toDate,
  );
  return toInvoiceProfile(invoice, buildLineItems(appointments));
}

export async function softDeleteInvoiceRecord(id: string, actorId: string) {
  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: actorId },
  });
}
