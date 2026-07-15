import type { AssessmentProfile } from "@ebraz/types/assessments";
import {
  buildAssessmentAdminSms,
  buildAssessmentClientSms,
  sendSingleSms,
  sendSmsSafely,
} from "@/lib/sms";

export async function notifyAssessmentRegistered(
  assessment: AssessmentProfile,
): Promise<void> {
  await sendSmsSafely("assessment client", () =>
    sendSingleSms(assessment.client.phone, buildAssessmentClientSms(assessment.client.name)),
  );

  const adminPhone = process.env.SMS_ADMIN_PHONE?.trim();
  if (!adminPhone) return;

  const text = buildAssessmentAdminSms({
    clientName: assessment.client.name,
    clientPhone: assessment.client.phone,
    date: assessment.date ? new Date(assessment.date) : null,
    time: assessment.time,
  });

  await sendSmsSafely("assessment admin", () => sendSingleSms(adminPhone, text));
}
