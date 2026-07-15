import type { Prisma } from "@ebraz/database";
import type { MedicalRecordProfile } from "@ebraz/types/medical-records";
import { toISODate } from "@ebraz/utils/date";
import { normalizePhone } from "@ebraz/utils/phone";

type MedicalRecordRecord = Prisma.MedicalRecordGetPayload<{
  include: typeof medicalRecordInclude;
}>;

export const medicalRecordInclude = {
  companion: true,
  images: {
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

function optionalString(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

export function toMedicalRecordProfile(record: MedicalRecordRecord): MedicalRecordProfile {
  return {
    id: record.id,
    recordNumber: record.recordNumber,
    clientId: record.clientId,
    therapistId: optionalString(record.therapistId),
    supervisorId: optionalString(record.supervisorId),
    adminId: optionalString(record.adminId),
    referenceSource: optionalString(record.referenceSource),
    admissionDate: toISODate(record.admissionDate),
    visitDate: toISODate(record.visitDate),
    chiefComplaints: optionalString(record.chiefComplaints),
    presentIllness: optionalString(record.presentIllness),
    pastHistory: optionalString(record.pastHistory),
    familyHistory: optionalString(record.familyHistory),
    personalHistory: optionalString(record.personalHistory),
    mse: optionalString(record.mse),
    diagnosis: optionalString(record.diagnosis),
    companion: record.companion
      ? {
          id: record.companion.id,
          name: record.companion.name,
          phone: record.companion.phone,
          birthDate: record.companion.birthDate
            ? toISODate(record.companion.birthDate)
            : undefined,
          address: optionalString(record.companion.address),
        }
      : undefined,
    images: record.images.map((image) => ({
      id: image.id,
      filePath: image.filePath,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function buildRecordData(
  input: {
    recordNumber: string;
    therapistId?: string;
    supervisorId?: string;
    adminId?: string;
    referenceSource?: string;
    admissionDate: Date;
    visitDate: Date;
    chiefComplaints?: string;
    presentIllness?: string;
    pastHistory?: string;
    familyHistory?: string;
    personalHistory?: string;
    mse?: string;
    diagnosis?: string;
  },
  actorId: string,
  companionId?: string | null,
) {
  return {
    recordNumber: input.recordNumber.trim(),
    therapistId: input.therapistId,
    supervisorId: input.supervisorId,
    adminId: input.adminId,
    companionId,
    referenceSource: input.referenceSource,
    admissionDate: input.admissionDate,
    visitDate: input.visitDate,
    chiefComplaints: input.chiefComplaints,
    presentIllness: input.presentIllness,
    pastHistory: input.pastHistory,
    familyHistory: input.familyHistory,
    personalHistory: input.personalHistory,
    mse: input.mse,
    diagnosis: input.diagnosis,
    updatedBy: actorId,
  };
}

export async function upsertCompanion(
  tx: Prisma.TransactionClient,
  companion: {
    name: string;
    phone: string;
    birthDate?: Date;
    address?: string;
  },
  actorId: string,
  existingCompanionId?: string | null,
) {
  const normalizedPhone = normalizePhone(companion.phone);

  if (existingCompanionId) {
    return tx.companion.update({
      where: { id: existingCompanionId },
      data: {
        name: companion.name.trim(),
        phone: normalizedPhone,
        birthDate: companion.birthDate,
        address: companion.address,
        updatedBy: actorId,
        deletedAt: null,
      },
    });
  }

  return tx.companion.upsert({
    where: { phone: normalizedPhone },
    update: {
      name: companion.name.trim(),
      birthDate: companion.birthDate,
      address: companion.address,
      updatedBy: actorId,
      deletedAt: null,
    },
    create: {
      name: companion.name.trim(),
      phone: normalizedPhone,
      birthDate: companion.birthDate,
      address: companion.address,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });
}
