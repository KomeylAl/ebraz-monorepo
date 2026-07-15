import { prisma, type OtpPurpose, type UserRole } from "@ebraz/database";
import { hashToken } from "@ebraz/utils/crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_PER_HOUR = 5;
const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOtpCode(code: string): string {
  return hashToken(code);
}

export function maskPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length < 4) return "****";
  return `${normalized.slice(0, 2)}****${normalized.slice(-4)}`;
}

export async function countRecentOtpSends(
  userId: string,
  userRole: UserRole,
  purpose: OtpPurpose,
  since: Date,
) {
  return prisma.otpChallenge.count({
    where: {
      userId,
      userRole,
      purpose,
      createdAt: { gte: since },
    },
  });
}

export async function findLatestActiveOtp(
  userId: string,
  userRole: UserRole,
  purpose: OtpPurpose,
) {
  return prisma.otpChallenge.findFirst({
    where: {
      userId,
      userRole,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOtpChallenge(input: {
  userId: string;
  userRole: UserRole;
  purpose: OtpPurpose;
  phone: string;
  code: string;
}) {
  const now = new Date();
  return prisma.otpChallenge.create({
    data: {
      userId: input.userId,
      userRole: input.userRole,
      purpose: input.purpose,
      phone: input.phone,
      codeHash: hashOtpCode(input.code),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    },
  });
}

export async function invalidateActiveOtps(
  userId: string,
  userRole: UserRole,
  purpose: OtpPurpose,
) {
  await prisma.otpChallenge.updateMany({
    where: {
      userId,
      userRole,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      consumedAt: new Date(),
    },
  });
}

export async function incrementOtpAttempts(id: string) {
  return prisma.otpChallenge.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
}

export async function consumeOtp(id: string) {
  return prisma.otpChallenge.update({
    where: { id },
    data: { consumedAt: new Date() },
  });
}

export const otpConfig = {
  ttlMs: OTP_TTL_MS,
  resendCooldownMs: OTP_RESEND_COOLDOWN_MS,
  maxPerHour: OTP_MAX_PER_HOUR,
  maxAttempts: OTP_MAX_ATTEMPTS,
  expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
};
