import type { AppointmentProfile } from "@ebraz/types/appointments";
import {
  buildNewAppointmentTherapistSms,
  sendSingleSms,
  sendSmsSafely,
} from "@/lib/sms";

export async function notifyTherapistNewAppointment(
  appointment: AppointmentProfile,
): Promise<void> {
  if (!appointment.therapist.phone) return;

  const text = buildNewAppointmentTherapistSms({
    clientName: appointment.client.name,
    date: appointment.date,
    time: appointment.time,
  });

  await sendSmsSafely("new appointment", () =>
    sendSingleSms(appointment.therapist.phone!, text),
  );
}
