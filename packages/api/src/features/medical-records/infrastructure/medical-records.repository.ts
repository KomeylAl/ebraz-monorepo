import { prisma } from "@ebraz/database";
import type { Prisma } from "@ebraz/database";
import type { UpsertMedicalRecordInput } from "@ebraz/validation/medical-records";
import {
  buildRecordData,
  medicalRecordInclude,
  toMedicalRecordProfile,
  upsertCompanion,
} from "../domain/medical-record.mapper";

export async function findClientById(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

export async function findTherapistById(id: string) {
  return prisma.therapist.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

export async function findAdminById(id: string) {
  return prisma.admin.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

export async function findRecordByClientId(clientId: string) {
  return prisma.medicalRecord.findFirst({
    where: { clientId, deletedAt: null },
    include: medicalRecordInclude,
  });
}

export async function findRecordByNumber(recordNumber: string, excludeId?: string) {
  return prisma.medicalRecord.findFirst({
    where: {
      recordNumber,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

async function syncImages(
  tx: Prisma.TransactionClient,
  medicalRecordId: string,
  imagePaths: string[] | undefined,
  actorId: string,
) {
  if (imagePaths === undefined) return;

  await tx.recordImage.updateMany({
    where: { medicalRecordId, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: actorId },
  });

  if (imagePaths.length === 0) return;

  await tx.recordImage.createMany({
    data: imagePaths.map((filePath) => ({
      medicalRecordId,
      filePath,
      createdBy: actorId,
      updatedBy: actorId,
    })),
  });
}

export async function upsertMedicalRecordForClient(
  clientId: string,
  input: UpsertMedicalRecordInput,
  actorId: string,
) {
  const existing = await findRecordByClientId(clientId);

  return prisma.$transaction(async (tx) => {
    let companionId: string | null | undefined = existing?.companionId ?? null;

    if (input.companion) {
      const companion = await upsertCompanion(
        tx,
        input.companion,
        actorId,
        existing?.companionId,
      );
      companionId = companion.id;
    }

    const recordData = buildRecordData(input, actorId, companionId);

    if (existing) {
      await tx.medicalRecord.update({
        where: { id: existing.id },
        data: recordData,
      });
    } else {
      await tx.medicalRecord.create({
        data: {
          ...recordData,
          clientId,
          createdBy: actorId,
        },
      });
    }

    const record = await tx.medicalRecord.findFirstOrThrow({
      where: { clientId, deletedAt: null },
      include: medicalRecordInclude,
    });

    await syncImages(tx, record.id, input.imagePaths, actorId);

    const refreshed = await tx.medicalRecord.findFirstOrThrow({
      where: { id: record.id },
      include: medicalRecordInclude,
    });

    return toMedicalRecordProfile(refreshed);
  });
}

export async function softDeleteMedicalRecordForClient(clientId: string, actorId: string) {
  const existing = await findRecordByClientId(clientId);
  if (!existing) return;

  await prisma.$transaction([
    prisma.medicalRecord.update({
      where: { id: existing.id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
    prisma.recordImage.updateMany({
      where: { medicalRecordId: existing.id, deletedAt: null },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
  ]);
}

export async function appendRecordImageForClient(
  clientId: string,
  filePath: string,
  actorId: string,
) {
  const record = await findRecordByClientId(clientId);
  if (!record) return null;

  return prisma.recordImage.create({
    data: {
      medicalRecordId: record.id,
      filePath,
      createdBy: actorId,
      updatedBy: actorId,
    },
    select: {
      id: true,
      filePath: true,
      createdAt: true,
    },
  });
}
