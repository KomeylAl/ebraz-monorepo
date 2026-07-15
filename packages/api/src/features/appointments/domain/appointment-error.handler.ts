import { AppointmentError } from "../domain/appointments.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleAppointmentError(err: unknown): Response {
  if (err instanceof AppointmentError) {
    switch (err.code) {
      case "APPOINTMENT_NOT_FOUND":
      case "THERAPIST_NOT_FOUND":
      case "CLIENT_NOT_FOUND":
        return notFound(err.message);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
