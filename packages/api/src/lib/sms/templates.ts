import { toISODate } from "@ebraz/utils/date";

export function buildNewAppointmentTherapistSms(input: {
  clientName: string;
  date: string;
  time: string;
}): string {
  return [
    "کلینیک ابراز",
    "نوبت جدید",
    `مراجع: ${input.clientName}`,
    `تاریخ: ${input.date}`,
    `ساعت: ${input.time}`,
  ].join("\n");
}

export function buildAssessmentClientSms(clientName: string): string {
  return [
    "کلینیک ابراز",
    `${clientName} عزیز`,
    "نوبت شما با موفقیت ثبت شد. همکاران ما به زودی با شما تماس خواهند گرفت.",
  ].join("\n");
}

export function buildAssessmentAdminSms(input: {
  clientName: string;
  clientPhone: string;
  date?: Date | null;
  time?: string | null;
}): string {
  const datePart = input.date ? toISODate(input.date) : "—";
  const timePart = input.time ?? "—";

  return [
    "ثبت ارزیابی جدید",
    `${input.clientName} با شماره ${input.clientPhone}`,
    `برای تاریخ ${datePart} ساعت ${timePart} درخواست ارزیابی ثبت کرده است.`,
  ].join("\n");
}

export function buildTherapistPasswordOtpSms(code: string): string {
  return [
    "کلینیک ابراز",
    `کد تایید تغییر رمز عبور: ${code}`,
    "این کد تا ۵ دقیقه معتبر است.",
    "در صورت عدم درخواست، این پیام را نادیده بگیرید.",
  ].join("\n");
}
