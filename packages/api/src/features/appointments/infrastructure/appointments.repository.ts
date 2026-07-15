import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateAppointmentInput,
  ListAppointmentsQuery,
  UpdateAppointmentInput,
} from "@ebraz/validation/appointments";
import { resolvePaymentAmount } from "@ebraz/validation/appointments";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { appointmentInclude, toAppointmentProfile } from "../domain/appointment.mapper";

function buildSearchFilter(search?: string): Prisma.AppointmentWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    OR: [
      { time: { contains: term, mode: "insensitive" } },
      { client: { name: { contains: term, mode: "insensitive" } } },
      { client: { phone: { contains: term, mode: "insensitive" } } },
      { therapist: { name: { contains: term, mode: "insensitive" } } },
    ],
  };
}

function buildListWhere(query: ListAppointmentsQuery): Prisma.AppointmentWhereInput {
  return {
    deletedAt: null,
    ...(query.date ? { date: query.date } : {}),
    ...(query.clientId ? { clientId: query.clientId } : {}),
    ...(query.therapistId ? { therapistId: query.therapistId } : {}),
    ...(buildSearchFilter(query.search) ?? {}),
  };
}

export async function listAppointments(query: ListAppointmentsQuery) {
  const where = buildListWhere(query);
  const { skip, take } = getSkipTake(query);

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take,
      orderBy: [{ date: "desc" }, { time: "desc" }],
      include: appointmentInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: items.map(toAppointmentProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findAppointmentById(id: string) {
  return prisma.appointment.findFirst({
    where: { id, deletedAt: null },
    include: appointmentInclude,
  });
}

export async function findTherapistExists(id: string) {
  return prisma.therapist.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

export async function findClientExists(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

export async function createAppointmentRecord(
  input: CreateAppointmentInput,
  actorId: string,
) {
  const paymentAmount = resolvePaymentAmount(input.amount, input.paymentStatus);

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        therapistId: input.therapistId,
        clientId: input.clientId,
        date: input.date,
        time: input.time,
        amount: input.amount,
        status: input.status,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    await tx.payment.create({
      data: {
        appointmentId: appointment.id,
        status: input.paymentStatus,
        amount: paymentAmount,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    const full = await tx.appointment.findFirstOrThrow({
      where: { id: appointment.id },
      include: appointmentInclude,
    });

    return toAppointmentProfile(full);
  });
}

export async function updateAppointmentRecord(
  id: string,
  input: UpdateAppointmentInput,
  actorId: string,
  current: NonNullable<Awaited<ReturnType<typeof findAppointmentById>>>,
) {
  const nextAmount = input.amount ?? current.amount;
  const nextPaymentStatus = input.paymentStatus ?? current.payment?.status ?? "pending";
  const paymentAmount = resolvePaymentAmount(nextAmount, nextPaymentStatus);

  return prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: {
        ...(input.therapistId !== undefined ? { therapistId: input.therapistId } : {}),
        ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.time !== undefined ? { time: input.time } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedBy: actorId,
      },
    });

    if (current.payment) {
      await tx.payment.update({
        where: { id: current.payment.id },
        data: {
          status: nextPaymentStatus,
          amount: paymentAmount,
          updatedBy: actorId,
        },
      });
    }

    const updated = await tx.appointment.findFirstOrThrow({
      where: { id },
      include: appointmentInclude,
    });

    return toAppointmentProfile(updated);
  });
}

export async function softDeleteAppointmentRecord(id: string, actorId: string) {
  await prisma.$transaction([
    prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
    prisma.payment.updateMany({
      where: { appointmentId: id, deletedAt: null },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
  ]);
}
