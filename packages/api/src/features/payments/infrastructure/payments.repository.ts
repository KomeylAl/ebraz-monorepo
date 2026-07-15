import { prisma, type Prisma } from "@ebraz/database";
import type { ListPaymentsQuery, UpdatePaymentInput } from "@ebraz/validation/payments";
import { resolvePaymentAmount } from "@ebraz/validation/appointments";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { paymentInclude, toPaymentListItem, toPaymentProfile } from "../domain/payment.mapper";

function buildSearchFilter(search?: string): Prisma.PaymentWhereInput | undefined {
  if (!search?.trim()) return undefined;
  const term = search.trim();
  return {
    OR: [
      { appointment: { client: { name: { contains: term, mode: "insensitive" } } } },
      { appointment: { client: { phone: { contains: term, mode: "insensitive" } } } },
      { appointment: { therapist: { name: { contains: term, mode: "insensitive" } } } },
    ],
  };
}

function buildListWhere(query: ListPaymentsQuery): Prisma.PaymentWhereInput {
  return {
    deletedAt: null,
    appointment: {
      deletedAt: null,
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...(query.therapistId ? { therapistId: query.therapistId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            date: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    },
    ...(query.status ? { status: query.status } : {}),
    ...(buildSearchFilter(query.search) ?? {}),
  };
}

export async function listPayments(query: ListPaymentsQuery) {
  const where = buildListWhere(query);
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: paymentInclude,
    }),
    prisma.payment.count({ where }),
  ]);
  return {
    data: items.map(toPaymentListItem),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findPaymentById(id: string) {
  return prisma.payment.findFirst({
    where: { id, deletedAt: null, appointment: { deletedAt: null } },
    include: paymentInclude,
  });
}

export async function updatePaymentRecord(
  id: string,
  input: UpdatePaymentInput,
  actorId: string,
  current: NonNullable<Awaited<ReturnType<typeof findPaymentById>>>,
) {
  const nextStatus = input.status ?? current.status;
  const appointmentAmount = current.appointment.amount;
  const nextAmount =
    input.amount !== undefined
      ? resolvePaymentAmount(input.amount, nextStatus)
      : resolvePaymentAmount(appointmentAmount, nextStatus);

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      amount: nextAmount,
      updatedBy: actorId,
    },
    include: paymentInclude,
  });
  return toPaymentProfile(payment);
}
