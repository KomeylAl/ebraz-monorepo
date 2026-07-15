import type { Prisma } from "@ebraz/database";
import type { AppointmentProfile } from "@ebraz/types/appointments";
import { toISODate } from "@ebraz/utils/date";

type AppointmentRecord = Prisma.AppointmentGetPayload<{
  include: {
    client: { select: { id: true; name: true; phone: true } };
    therapist: { select: { id: true; name: true; phone: true } };
    payment: true;
  };
}>;

export function toAppointmentProfile(appointment: AppointmentRecord): AppointmentProfile {
  return {
    id: appointment.id,
    date: toISODate(appointment.date),
    time: appointment.time,
    amount: appointment.amount,
    status: appointment.status,
    paymentStatus: appointment.payment?.status ?? "pending",
    paymentAmount: appointment.payment?.amount ?? 0,
    client: {
      id: appointment.client.id,
      name: appointment.client.name,
      phone: appointment.client.phone,
    },
    therapist: {
      id: appointment.therapist.id,
      name: appointment.therapist.name,
      phone: appointment.therapist.phone,
    },
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}

export const appointmentInclude = {
  client: { select: { id: true, name: true, phone: true } },
  therapist: { select: { id: true, name: true, phone: true } },
  payment: true,
} as const;
