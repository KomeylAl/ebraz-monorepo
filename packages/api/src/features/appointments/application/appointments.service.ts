import type {
  CreateAppointmentInput,
  ListAppointmentsQuery,
  UpdateAppointmentInput,
} from "@ebraz/validation/appointments";
import { toAppointmentProfile } from "../domain/appointment.mapper";
import { AppointmentError } from "../domain/appointments.errors";
import {
  createAppointmentRecord,
  findAppointmentById,
  findClientExists,
  findTherapistExists,
  listAppointments,
  softDeleteAppointmentRecord,
  updateAppointmentRecord,
} from "../infrastructure/appointments.repository";
import { notifyTherapistNewAppointment } from "./appointment-sms";
import { notifyTherapistAppointmentCreated } from "@/features/notifications/application/notifications.service";

async function assertParticipants(
  therapistId: string,
  clientId: string,
): Promise<void> {
  const [therapist, client] = await Promise.all([
    findTherapistExists(therapistId),
    findClientExists(clientId),
  ]);

  if (!therapist) {
    throw new AppointmentError("Therapist not found", "THERAPIST_NOT_FOUND");
  }
  if (!client) {
    throw new AppointmentError("Client not found", "CLIENT_NOT_FOUND");
  }
}

export async function getAppointments(query: ListAppointmentsQuery) {
  return listAppointments(query);
}

export async function getAppointmentsByDate(date: Date, query: ListAppointmentsQuery) {
  return listAppointments({ ...query, date });
}

export async function getAppointment(id: string) {
  const appointment = await findAppointmentById(id);
  if (!appointment) {
    throw new AppointmentError("Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  return toAppointmentProfile(appointment);
}

export async function createAppointment(input: CreateAppointmentInput, actorId: string) {
  await assertParticipants(input.therapistId, input.clientId);
  const appointment = await createAppointmentRecord(input, actorId);
  void notifyTherapistNewAppointment(appointment);
  void notifyTherapistAppointmentCreated({
    therapistId: appointment.therapist.id,
    clientName: appointment.client.name,
    date: appointment.date,
    time: appointment.time,
    appointmentId: appointment.id,
  });
  return appointment;
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
  actorId: string,
) {
  const appointment = await findAppointmentById(id);
  if (!appointment) {
    throw new AppointmentError("Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  const therapistId = input.therapistId ?? appointment.therapistId;
  const clientId = input.clientId ?? appointment.clientId;

  if (input.therapistId || input.clientId) {
    await assertParticipants(therapistId, clientId);
  }

  return updateAppointmentRecord(id, input, actorId, appointment);
}

export async function deleteAppointment(id: string, actorId: string) {
  const appointment = await findAppointmentById(id);
  if (!appointment) {
    throw new AppointmentError("Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  await softDeleteAppointmentRecord(id, actorId);
}
