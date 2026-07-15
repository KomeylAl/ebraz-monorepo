export { sendBulkSms, sendSingleSms } from "./smsir.client";
export {
  buildAssessmentAdminSms,
  buildAssessmentClientSms,
  buildNewAppointmentTherapistSms,
  buildTherapistPasswordOtpSms,
} from "./templates";

export async function sendSmsSafely(
  label: string,
  send: () => Promise<unknown>,
): Promise<void> {
  try {
    await send();
  } catch (error) {
    console.error(`[SMS] ${label} failed:`, error);
  }
}
