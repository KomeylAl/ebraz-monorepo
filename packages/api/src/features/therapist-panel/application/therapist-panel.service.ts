import type { AccessTokenPayload } from "@ebraz/types";
import type {
  ChangeTherapistPasswordInput,
  CreateTherapistResourceInput,
  ListTherapistPanelQuery,
  UpdateTherapistMeInput,
  UpdateTherapistResourceInput,
  UpsertTherapistResumeInput,
} from "@ebraz/validation/therapist-panel";
import { addDays, startOfDay } from "@ebraz/utils/date";
import { hashPassword } from "@ebraz/auth/server";
import { getNotifications } from "@/features/notifications/application/notifications.service";
import {
  findTherapistById,
  findTherapistByPhone,
  setTherapistPasswordRecord,
  updateTherapistRecord,
} from "@/features/therapists/infrastructure/therapists.repository";
import { buildTherapistPasswordOtpSms, sendSingleSms } from "@/lib/sms";
import { TherapistPanelError } from "../domain/therapist-panel.errors";
import {
  createTherapistResourceRecord,
  deleteTherapistResourceRecord,
  findTherapistClient,
  findTherapistClientMedicalRecord,
  findTherapistResume,
  getTherapistDashboardStats,
  listTherapistAppointments,
  listTherapistAppointmentsInRange,
  listTherapistAssessments,
  listTherapistClients,
  listTherapistResources,
  therapistExists,
  updateTherapistResourceRecord,
  upsertTherapistResumeRecord,
} from "../infrastructure/therapist-panel.repository";
import {
  consumeOtp,
  countRecentOtpSends,
  createOtpChallenge,
  findLatestActiveOtp,
  generateOtpCode,
  hashOtpCode,
  incrementOtpAttempts,
  invalidateActiveOtps,
  maskPhone,
  otpConfig,
} from "../infrastructure/otp.repository";

function assertTherapist(auth: AccessTokenPayload): string {
  if (auth.role !== "THERAPIST") {
    throw new TherapistPanelError("Therapist access only", "FORBIDDEN");
  }
  return auth.sub;
}

export async function getDashboard(auth: AccessTokenPayload) {
  const therapistId = assertTherapist(auth);
  return getTherapistDashboardStats(therapistId);
}

export async function getTherapistAppointments(
  auth: AccessTokenPayload,
  query: ListTherapistPanelQuery,
) {
  const therapistId = assertTherapist(auth);
  return listTherapistAppointments(therapistId, query, query.date);
}

export async function getTherapistAssessments(
  auth: AccessTokenPayload,
  query: ListTherapistPanelQuery,
) {
  const therapistId = assertTherapist(auth);
  return listTherapistAssessments(therapistId, query, query.date);
}

export async function getTherapistNotifications(
  auth: AccessTokenPayload,
  query: ListTherapistPanelQuery,
) {
  assertTherapist(auth);
  return getNotifications(auth, query);
}

export async function getResume(auth: AccessTokenPayload) {
  const therapistId = assertTherapist(auth);
  return findTherapistResume(therapistId);
}

export async function saveResume(auth: AccessTokenPayload, input: UpsertTherapistResumeInput) {
  const therapistId = assertTherapist(auth);
  return upsertTherapistResumeRecord(therapistId, input);
}

export async function getResources(auth: AccessTokenPayload, query: ListTherapistPanelQuery) {
  const therapistId = assertTherapist(auth);
  return listTherapistResources(therapistId, query);
}

export async function createResource(
  auth: AccessTokenPayload,
  input: CreateTherapistResourceInput,
) {
  const therapistId = assertTherapist(auth);
  return createTherapistResourceRecord(therapistId, input);
}

export async function updateResource(
  auth: AccessTokenPayload,
  id: string,
  input: UpdateTherapistResourceInput,
) {
  const therapistId = assertTherapist(auth);
  const resource = await updateTherapistResourceRecord(therapistId, id, input);
  if (!resource) throw new TherapistPanelError("Resource not found", "NOT_FOUND");
  return resource;
}

export async function deleteResource(auth: AccessTokenPayload, id: string) {
  const therapistId = assertTherapist(auth);
  const deleted = await deleteTherapistResourceRecord(therapistId, id);
  if (!deleted) throw new TherapistPanelError("Resource not found", "NOT_FOUND");
}

export async function getAdminTherapistSevenDays(
  therapistId: string,
  query: ListTherapistPanelQuery,
) {
  const therapist = await therapistExists(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");

  const today = startOfDay(new Date());
  const end = addDays(today, 7);
  return listTherapistAppointmentsInRange(therapistId, today, end, query);
}

export async function getAdminTherapistThirtyDays(
  therapistId: string,
  query: ListTherapistPanelQuery,
) {
  const therapist = await therapistExists(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");

  const today = startOfDay(new Date());
  const end = addDays(today, 30);
  return listTherapistAppointmentsInRange(therapistId, today, end, query);
}

export async function getAdminTherapistResume(therapistId: string) {
  const therapist = await therapistExists(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");
  return findTherapistResume(therapistId);
}

export async function saveAdminTherapistResume(
  therapistId: string,
  input: UpsertTherapistResumeInput,
) {
  const therapist = await therapistExists(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");
  return upsertTherapistResumeRecord(therapistId, input);
}

export async function getTherapistClients(
  auth: AccessTokenPayload,
  query: ListTherapistPanelQuery,
) {
  const therapistId = assertTherapist(auth);
  return listTherapistClients(therapistId, query);
}

export async function getTherapistClient(auth: AccessTokenPayload, clientId: string) {
  const therapistId = assertTherapist(auth);
  const client = await findTherapistClient(therapistId, clientId);
  if (!client) throw new TherapistPanelError("Client not found", "NOT_FOUND");
  return client;
}

export async function getTherapistClientRecord(auth: AccessTokenPayload, clientId: string) {
  const therapistId = assertTherapist(auth);
  const client = await findTherapistClient(therapistId, clientId);
  if (!client) throw new TherapistPanelError("Client not found", "NOT_FOUND");

  const record = await findTherapistClientMedicalRecord(therapistId, clientId);
  if (!record) throw new TherapistPanelError("Medical record not found", "NOT_FOUND");
  return record;
}

export async function getMyProfile(auth: AccessTokenPayload) {
  const therapistId = assertTherapist(auth);
  const therapist = await findTherapistById(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");

  return {
    id: therapist.id,
    name: therapist.name,
    phone: therapist.phone,
    email: therapist.email,
    nationalCode: therapist.nationalCode,
    birthDate: therapist.birthDate.toISOString().slice(0, 10),
    cardNumber: therapist.cardNumber,
    medicalNumber: therapist.medicalNumber,
    avatar: therapist.avatar,
    times: therapist.times,
    days: therapist.days,
  };
}

export async function updateMyProfile(auth: AccessTokenPayload, input: UpdateTherapistMeInput) {
  const therapistId = assertTherapist(auth);
  const therapist = await findTherapistById(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");

  if (input.phone) {
    const existing = await findTherapistByPhone(input.phone, therapistId);
    if (existing) {
      throw new TherapistPanelError("این شماره قبلاً ثبت شده است", "PHONE_EXISTS");
    }
  }

  return updateTherapistRecord(
    therapistId,
    {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.times !== undefined ? { times: input.times } : {}),
      ...(input.days !== undefined ? { days: input.days } : {}),
    },
    therapistId,
  );
}

export async function sendPasswordOtp(auth: AccessTokenPayload) {
  const therapistId = assertTherapist(auth);
  const therapist = await findTherapistById(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");
  if (!therapist.phone) {
    throw new TherapistPanelError("شماره موبایل برای ارسال کد یافت نشد", "PHONE_MISSING");
  }

  const latest = await findLatestActiveOtp(
    therapistId,
    "THERAPIST",
    "THERAPIST_PASSWORD_CHANGE",
  );
  if (latest) {
    const elapsed = Date.now() - latest.createdAt.getTime();
    if (elapsed < otpConfig.resendCooldownMs) {
      const retryAfter = Math.ceil((otpConfig.resendCooldownMs - elapsed) / 1000);
      throw new TherapistPanelError(
        `لطفاً ${retryAfter} ثانیه دیگر دوباره تلاش کنید`,
        "OTP_RATE_LIMITED",
      );
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await countRecentOtpSends(
    therapistId,
    "THERAPIST",
    "THERAPIST_PASSWORD_CHANGE",
    oneHourAgo,
  );
  if (recentCount >= otpConfig.maxPerHour) {
    throw new TherapistPanelError(
      "تعداد درخواست کد در این ساعت به سقف مجاز رسیده است",
      "OTP_RATE_LIMITED",
    );
  }

  await invalidateActiveOtps(therapistId, "THERAPIST", "THERAPIST_PASSWORD_CHANGE");

  const code = generateOtpCode();
  await createOtpChallenge({
    userId: therapistId,
    userRole: "THERAPIST",
    purpose: "THERAPIST_PASSWORD_CHANGE",
    phone: therapist.phone,
    code,
  });

  const smsResult = await sendSingleSms(therapist.phone, buildTherapistPasswordOtpSms(code));
  if (smsResult.status !== 1) {
    throw new TherapistPanelError("ارسال پیامک ناموفق بود. دوباره تلاش کنید", "SMS_FAILED");
  }

  return {
    message: "کد تایید ارسال شد",
    expiresIn: otpConfig.expiresInSeconds,
    maskedPhone: maskPhone(therapist.phone),
  };
}

export async function changePasswordWithOtp(
  auth: AccessTokenPayload,
  input: ChangeTherapistPasswordInput,
) {
  const therapistId = assertTherapist(auth);
  const therapist = await findTherapistById(therapistId);
  if (!therapist) throw new TherapistPanelError("Therapist not found", "NOT_FOUND");

  const challenge = await findLatestActiveOtp(
    therapistId,
    "THERAPIST",
    "THERAPIST_PASSWORD_CHANGE",
  );
  if (!challenge) {
    throw new TherapistPanelError("کد تایید معتبر یافت نشد. دوباره درخواست دهید", "OTP_NOT_FOUND");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    await consumeOtp(challenge.id);
    throw new TherapistPanelError("تعداد تلاش‌ها بیش از حد مجاز است", "OTP_MAX_ATTEMPTS");
  }

  const isValid = hashOtpCode(input.code) === challenge.codeHash;
  if (!isValid) {
    await incrementOtpAttempts(challenge.id);
    throw new TherapistPanelError("کد تایید نادرست است", "OTP_INVALID");
  }

  const passwordHash = await hashPassword(input.password);
  await setTherapistPasswordRecord(therapistId, passwordHash, therapistId);
  await consumeOtp(challenge.id);

  return { message: "رمز عبور با موفقیت تغییر کرد" };
}
