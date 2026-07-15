import { randomUUID } from "node:crypto";
import { prisma, type Prisma } from "@ebraz/database";
import type { BackupType } from "@ebraz/types/backup-restore";
import {
  isLegacyNumericId,
  normalizeLegacyBackupRecord,
  pickKnownFields,
} from "./normalize-backup-item";

type JsonRecord = Record<string, unknown>;

const THERAPIST_FIELDS = [
  "id",
  "name",
  "phone",
  "password",
  "nationalCode",
  "birthDate",
  "cardNumber",
  "medicalNumber",
  "email",
  "avatar",
  "times",
  "days",
  "resume",
  "profilePath",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "deletedAt",
  "deletedBy",
] as const;

const ADMIN_FIELDS = [
  "id",
  "name",
  "phone",
  "password",
  "subRole",
  "birthDate",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "deletedAt",
  "deletedBy",
] as const;

const CLIENT_FIELDS = [
  "id",
  "name",
  "phone",
  "password",
  "birthDate",
  "address",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "deletedAt",
  "deletedBy",
] as const;

const THERAPIST_RESUME_FIELDS = [
  "id",
  "therapistId",
  "title",
  "bio",
  "specialization",
  "educations",
  "experiences",
  "skills",
  "certifications",
  "content",
  "socialLinks",
  "filePath",
  "createdAt",
  "updatedAt",
] as const;

function asDate(value: unknown): Date | null | undefined {
  if (value === null || value === undefined) return value as null | undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string" && value.trim()) return new Date(value);
  return undefined;
}

function reviveDates(item: JsonRecord, fields: string[]): JsonRecord {
  const next = { ...item };
  for (const field of fields) {
    if (field in next) {
      next[field] = asDate(next[field]);
    }
  }
  return next;
}

const DATE_AUDIT_FIELDS = ["createdAt", "updatedAt", "deletedAt"];

function splitSoftDeleteRow(
  raw: JsonRecord,
  dateFields: string[],
): { id: string; create: JsonRecord; update: JsonRecord } {
  const item = reviveDates(raw, dateFields);
  const id = String(item.id);
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = item;
  const restored = { ...rest, deletedAt: null, deletedBy: null };
  return {
    id,
    create: { ...restored, id, createdAt: item.createdAt, updatedAt: item.updatedAt },
    update: restored,
  };
}

async function upsertSoftDeleteRow(
  upsert: (args: {
    where: { id: string };
    create: JsonRecord;
    update: JsonRecord;
  }) => Promise<unknown>,
  raw: JsonRecord,
  dateFields: string[],
) {
  const row = splitSoftDeleteRow(raw, dateFields);
  await upsert({
    where: { id: row.id },
    create: row.create,
    update: row.update,
  });
}

export async function exportEntityData(type: BackupType): Promise<unknown> {
  switch (type) {
    case "ADMIN":
      return prisma.admin.findMany({ orderBy: { createdAt: "asc" } });
    case "THERAPIST":
      return prisma.therapist.findMany({ orderBy: { createdAt: "asc" } });
    case "THERAPIST_RESUME":
      return prisma.therapistResume.findMany({ orderBy: { createdAt: "asc" } });
    case "CLIENT":
      return prisma.client.findMany({ orderBy: { createdAt: "asc" } });
    case "CATEGORY":
      return prisma.category.findMany({ orderBy: { createdAt: "asc" } });
    case "TAG":
      return prisma.tag.findMany({ orderBy: { createdAt: "asc" } });
    case "POST": {
      const posts = await prisma.post.findMany({
        include: { tags: true },
        orderBy: { createdAt: "asc" },
      });
      return posts.map(({ tags, ...post }) => ({
        ...post,
        tagIds: tags.map((tag) => tag.tagId),
      }));
    }
    case "WORKSHOP": {
      const workshops = await prisma.workshop.findMany({
        include: {
          sessions: true,
          participants: {
            include: { participant: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      return workshops.map(({ sessions, participants, ...workshop }) => ({
        ...workshop,
        sessions,
        participants: participants.map((row) => ({
          participant: row.participant,
          approved: row.approved,
          joinedAt: row.joinedAt,
          registeredAt: row.registeredAt,
        })),
      }));
    }
    case "ABOUT":
      return prisma.about.findMany({ orderBy: { createdAt: "asc" } });
    case "DEPARTMENT": {
      const departments = await prisma.department.findMany({
        include: { therapists: true },
        orderBy: { createdAt: "asc" },
      });
      return departments.map(({ therapists, ...department }) => ({
        ...department,
        therapistIds: therapists.map((row) => row.therapistId),
      }));
    }
    case "CLIENT_RECORD": {
      const records = await prisma.medicalRecord.findMany({
        include: {
          images: true,
          companion: true,
        },
        orderBy: { createdAt: "asc" },
      });
      return records.map(({ images, companion, ...record }) => ({
        ...record,
        companion,
        images,
      }));
    }
    case "APPOINTMENT": {
      const appointments = await prisma.appointment.findMany({
        include: { payment: true },
        orderBy: { createdAt: "asc" },
      });
      return appointments.map(({ payment, ...appointment }) => ({
        ...appointment,
        payment,
      }));
    }
    case "PAYMENT":
      return prisma.payment.findMany({ orderBy: { createdAt: "asc" } });
    case "ASSESSMENT": {
      const assessments = await prisma.initAssessment.findMany({
        include: { assignment: true },
        orderBy: { createdAt: "asc" },
      });
      return assessments.map(({ assignment, ...assessment }) => ({
        ...assessment,
        assignment,
      }));
    }
    default:
      return [];
  }
}

export async function restoreEntityData(type: BackupType, items: JsonRecord[]): Promise<number> {
  const normalized = items.map((item) => normalizeLegacyBackupRecord(item));

  switch (type) {
    case "ADMIN":
      return restoreAdmins(normalized);
    case "THERAPIST":
      return restoreTherapists(normalized);
    case "THERAPIST_RESUME":
      return restoreTherapistResumes(normalized);
    case "CLIENT":
      return restoreClients(normalized);
    case "CATEGORY":
      return restoreCategories(normalized);
    case "TAG":
      return restoreTags(normalized);
    case "POST":
      return restorePosts(normalized);
    case "WORKSHOP":
      return restoreWorkshops(normalized);
    case "ABOUT":
      return restoreAbout(normalized);
    case "DEPARTMENT":
      return restoreDepartments(normalized);
    case "CLIENT_RECORD":
      return restoreClientRecords(normalized);
    case "APPOINTMENT":
      return restoreAppointments(normalized);
    case "PAYMENT":
      return restorePayments(normalized);
    case "ASSESSMENT":
      return restoreAssessments(normalized);
    default:
      return 0;
  }
}

async function resolvePersonId(
  item: JsonRecord,
  findExisting: () => Promise<string | undefined>,
): Promise<string> {
  const existingId = await findExisting();
  if (existingId) return existingId;

  const rawId = item.id;
  if (rawId !== null && rawId !== undefined && !isLegacyNumericId(rawId)) {
    return String(rawId);
  }

  return randomUUID();
}

async function restoreAdmins(items: JsonRecord[]) {
  for (const raw of items) {
    const withSubRole = {
      ...raw,
      subRole: raw.subRole ?? raw.role ?? "boss",
    };
    const picked = pickKnownFields(withSubRole, ADMIN_FIELDS);
    const id = await resolvePersonId(picked, async () => {
      const phone = typeof picked.phone === "string" ? picked.phone : undefined;
      if (phone) {
        const byPhone = await prisma.admin.findUnique({
          where: { phone },
          select: { id: true },
        });
        if (byPhone) return byPhone.id;
      }
      return undefined;
    });

    await upsertSoftDeleteRow(
      (args) => prisma.admin.upsert(args as never),
      { ...picked, id },
      ["birthDate", ...DATE_AUDIT_FIELDS],
    );
  }
  return items.length;
}

async function restoreTherapists(items: JsonRecord[]) {
  for (const raw of items) {
    const picked = pickKnownFields(raw, THERAPIST_FIELDS);
    const id = await resolvePersonId(picked, async () => {
      const phone = typeof picked.phone === "string" ? picked.phone : undefined;
      if (phone) {
        const byPhone = await prisma.therapist.findUnique({
          where: { phone },
          select: { id: true },
        });
        if (byPhone) return byPhone.id;
      }

      const nationalCode =
        typeof picked.nationalCode === "string" ? picked.nationalCode : undefined;
      if (nationalCode) {
        const byCode = await prisma.therapist.findUnique({
          where: { nationalCode },
          select: { id: true },
        });
        if (byCode) return byCode.id;
      }

      return undefined;
    });

    await upsertSoftDeleteRow(
      (args) => prisma.therapist.upsert(args as never),
      { ...picked, id },
      ["birthDate", ...DATE_AUDIT_FIELDS],
    );
  }
  return items.length;
}

async function restoreTherapistResumes(items: JsonRecord[]) {
  for (const raw of items) {
    const picked = pickKnownFields(raw, THERAPIST_RESUME_FIELDS);
    const therapistId =
      typeof picked.therapistId === "string"
        ? picked.therapistId
        : String(picked.therapistId ?? "");

    if (!therapistId) {
      throw new Error("Resume is missing doctor_id/therapistId");
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { id: true },
    });
    if (!therapist) {
      throw new Error(`Therapist ${therapistId} referenced by resume was not found`);
    }

    const revived = reviveDates(picked, ["createdAt", "updatedAt"]);
    const id = isLegacyNumericId(revived.id)
      ? randomUUID()
      : String(revived.id ?? randomUUID());
    const item = {
      ...revived,
      id,
      therapistId,
    } as Prisma.TherapistResumeUncheckedCreateInput;
    const {
      id: _id,
      therapistId: _therapistId,
      createdAt: _createdAt,
      ...update
    } = item;

    await prisma.therapistResume.upsert({
      where: { therapistId },
      create: item,
      update,
    });
  }
  return items.length;
}

async function restoreClients(items: JsonRecord[]) {
  for (const raw of items) {
    const picked = pickKnownFields(raw, CLIENT_FIELDS);
    const id = await resolvePersonId(picked, async () => {
      const phone = typeof picked.phone === "string" ? picked.phone : undefined;
      if (phone) {
        const byPhone = await prisma.client.findUnique({
          where: { phone },
          select: { id: true },
        });
        if (byPhone) return byPhone.id;
      }
      return undefined;
    });

    await upsertSoftDeleteRow(
      (args) => prisma.client.upsert(args as never),
      { ...picked, id },
      ["birthDate", ...DATE_AUDIT_FIELDS],
    );
  }
  return items.length;
}

async function restoreCategories(items: JsonRecord[]) {
  for (const raw of items) {
    await upsertSoftDeleteRow(
      (args) => prisma.category.upsert(args as never),
      raw,
      DATE_AUDIT_FIELDS,
    );
  }
  return items.length;
}

async function restoreTags(items: JsonRecord[]) {
  for (const raw of items) {
    await upsertSoftDeleteRow(
      (args) => prisma.tag.upsert(args as never),
      raw,
      DATE_AUDIT_FIELDS,
    );
  }
  return items.length;
}

async function restorePosts(items: JsonRecord[]) {
  for (const raw of items) {
    const tagIds = Array.isArray(raw.tagIds) ? (raw.tagIds as string[]) : [];
    const { tagIds: _tagIds, ...rest } = raw;
    const row = splitSoftDeleteRow(rest, ["publishedAt", ...DATE_AUDIT_FIELDS]);

    await prisma.post.upsert({
      where: { id: row.id },
      create: row.create as Prisma.PostUncheckedCreateInput,
      update: row.update as Prisma.PostUncheckedUpdateInput,
    });

    await prisma.postTag.deleteMany({ where: { postId: row.id } });
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: row.id,
          tagId,
        })),
        skipDuplicates: true,
      });
    }
  }
  return items.length;
}

async function restoreWorkshops(items: JsonRecord[]) {
  for (const raw of items) {
    const sessions = Array.isArray(raw.sessions) ? (raw.sessions as JsonRecord[]) : [];
    const participants = Array.isArray(raw.participants) ? (raw.participants as JsonRecord[]) : [];
    const { sessions: _s, participants: _p, ...rest } = raw;
    const row = splitSoftDeleteRow(rest, ["startDate", "endDate", ...DATE_AUDIT_FIELDS]);

    await prisma.workshop.upsert({
      where: { id: row.id },
      create: row.create as Prisma.WorkshopUncheckedCreateInput,
      update: row.update as Prisma.WorkshopUncheckedUpdateInput,
    });

    for (const sessionRaw of sessions) {
      const sessionRow = splitSoftDeleteRow(sessionRaw, ["sessionDate", ...DATE_AUDIT_FIELDS]);
      await prisma.workshopSession.upsert({
        where: { id: sessionRow.id },
        create: { ...(sessionRow.create as Prisma.WorkshopSessionUncheckedCreateInput), workshopId: row.id },
        update: { ...(sessionRow.update as Prisma.WorkshopSessionUncheckedUpdateInput), workshopId: row.id },
      });
    }

    for (const entry of participants) {
      const participantRaw = (entry.participant as JsonRecord) ?? entry;
      const participantRow = splitSoftDeleteRow(participantRaw, DATE_AUDIT_FIELDS);
      await prisma.participant.upsert({
        where: { id: participantRow.id },
        create: participantRow.create as Prisma.ParticipantUncheckedCreateInput,
        update: participantRow.update as Prisma.ParticipantUncheckedUpdateInput,
      });

      await prisma.participantWorkshop.upsert({
        where: {
          participantId_workshopId: {
            participantId: participantRow.id,
            workshopId: row.id,
          },
        },
        create: {
          participantId: participantRow.id,
          workshopId: row.id,
          approved: Boolean(entry.approved),
          joinedAt: asDate(entry.joinedAt) ?? null,
          registeredAt: asDate(entry.registeredAt) ?? new Date(),
        },
        update: {
          approved: Boolean(entry.approved),
          joinedAt: asDate(entry.joinedAt) ?? null,
          registeredAt: asDate(entry.registeredAt) ?? new Date(),
        },
      });
    }
  }
  return items.length;
}

async function restoreAbout(items: JsonRecord[]) {
  for (const raw of items) {
    await upsertSoftDeleteRow(
      (args) => prisma.about.upsert(args as never),
      raw,
      DATE_AUDIT_FIELDS,
    );
  }
  return items.length;
}

async function restoreDepartments(items: JsonRecord[]) {
  for (const raw of items) {
    const therapistIds = Array.isArray(raw.therapistIds) ? (raw.therapistIds as string[]) : [];
    const { therapistIds: _therapistIds, ...rest } = raw;
    const row = splitSoftDeleteRow(rest, DATE_AUDIT_FIELDS);

    await prisma.department.upsert({
      where: { id: row.id },
      create: row.create as Prisma.DepartmentUncheckedCreateInput,
      update: row.update as Prisma.DepartmentUncheckedUpdateInput,
    });

    await prisma.departmentTherapist.deleteMany({ where: { departmentId: row.id } });
    if (therapistIds.length > 0) {
      await prisma.departmentTherapist.createMany({
        data: therapistIds.map((therapistId) => ({
          departmentId: row.id,
          therapistId,
        })),
        skipDuplicates: true,
      });
    }
  }
  return items.length;
}

async function restoreClientRecords(items: JsonRecord[]) {
  for (const raw of items) {
    const companionRaw = raw.companion as JsonRecord | null | undefined;
    const images = Array.isArray(raw.images) ? (raw.images as JsonRecord[]) : [];
    const { companion: _c, images: _i, ...rest } = raw;
    const row = splitSoftDeleteRow(rest, ["admissionDate", "visitDate", ...DATE_AUDIT_FIELDS]);

    let companionId = (row.create.companionId as string | null | undefined) ?? null;
    if (companionRaw) {
      const companionRow = splitSoftDeleteRow(companionRaw, ["birthDate", ...DATE_AUDIT_FIELDS]);
      await prisma.companion.upsert({
        where: { id: companionRow.id },
        create: companionRow.create as Prisma.CompanionUncheckedCreateInput,
        update: companionRow.update as Prisma.CompanionUncheckedUpdateInput,
      });
      companionId = companionRow.id;
    }

    await prisma.medicalRecord.upsert({
      where: { id: row.id },
      create: { ...(row.create as Prisma.MedicalRecordUncheckedCreateInput), companionId },
      update: { ...(row.update as Prisma.MedicalRecordUncheckedUpdateInput), companionId },
    });

    for (const imageRaw of images) {
      const imageRow = splitSoftDeleteRow(imageRaw, DATE_AUDIT_FIELDS);
      await prisma.recordImage.upsert({
        where: { id: imageRow.id },
        create: { ...(imageRow.create as Prisma.RecordImageUncheckedCreateInput), medicalRecordId: row.id },
        update: { ...(imageRow.update as Prisma.RecordImageUncheckedUpdateInput), medicalRecordId: row.id },
      });
    }
  }
  return items.length;
}

async function restoreAppointments(items: JsonRecord[]) {
  for (const raw of items) {
    const paymentRaw = raw.payment as JsonRecord | null | undefined;
    const { payment: _payment, ...rest } = raw;
    const row = splitSoftDeleteRow(rest, ["date", ...DATE_AUDIT_FIELDS]);

    await prisma.appointment.upsert({
      where: { id: row.id },
      create: row.create as Prisma.AppointmentUncheckedCreateInput,
      update: row.update as Prisma.AppointmentUncheckedUpdateInput,
    });

    if (paymentRaw) {
      const paymentRow = splitSoftDeleteRow(paymentRaw, DATE_AUDIT_FIELDS);
      await prisma.payment.upsert({
        where: { id: paymentRow.id },
        create: { ...(paymentRow.create as Prisma.PaymentUncheckedCreateInput), appointmentId: row.id },
        update: { ...(paymentRow.update as Prisma.PaymentUncheckedUpdateInput), appointmentId: row.id },
      });
    }
  }
  return items.length;
}

async function restorePayments(items: JsonRecord[]) {
  for (const raw of items) {
    await upsertSoftDeleteRow(
      (args) => prisma.payment.upsert(args as never),
      raw,
      DATE_AUDIT_FIELDS,
    );
  }
  return items.length;
}

async function restoreAssessments(items: JsonRecord[]) {
  for (const raw of items) {
    const assignmentRaw = raw.assignment as JsonRecord | null | undefined;
    const { assignment: _assignment, ...rest } = raw;
    const row = splitSoftDeleteRow(rest, ["date", ...DATE_AUDIT_FIELDS]);

    await prisma.initAssessment.upsert({
      where: { id: row.id },
      create: row.create as Prisma.InitAssessmentUncheckedCreateInput,
      update: row.update as Prisma.InitAssessmentUncheckedUpdateInput,
    });

    if (assignmentRaw) {
      const assignment = assignmentRaw as Prisma.AssessmentAssignmentUncheckedCreateInput;
      await prisma.assessmentAssignment.upsert({
        where: { initAssessmentId: row.id },
        create: { ...assignment, initAssessmentId: row.id },
        update: { ...assignment, initAssessmentId: row.id },
      });
    }
  }
  return items.length;
}
