import type { Prisma } from "@ebraz/database";
import type { TherapistProfile, TherapistPublicProfile } from "@ebraz/types/therapists";
import { toISODate } from "@ebraz/utils/date";

type TherapistRecord = Prisma.TherapistGetPayload<Record<string, never>>;

function optionalString(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

export function toTherapistProfile(therapist: TherapistRecord): TherapistProfile {
  return {
    id: therapist.id,
    name: therapist.name,
    phone: therapist.phone,
    nationalCode: therapist.nationalCode,
    birthDate: toISODate(therapist.birthDate),
    cardNumber: therapist.cardNumber,
    medicalNumber: optionalString(therapist.medicalNumber),
    email: optionalString(therapist.email),
    avatar: optionalString(therapist.avatar),
    times: optionalString(therapist.times),
    days: optionalString(therapist.days),
    resume: optionalString(therapist.resume),
    profilePath: optionalString(therapist.profilePath),
    createdAt: therapist.createdAt.toISOString(),
    updatedAt: therapist.updatedAt.toISOString(),
  };
}

export function toTherapistPublicProfile(
  therapist: TherapistRecord,
): TherapistPublicProfile {
  return {
    id: therapist.id,
    name: therapist.name,
    avatar: optionalString(therapist.avatar),
    times: optionalString(therapist.times),
    days: optionalString(therapist.days),
    profilePath: optionalString(therapist.profilePath),
  };
}
