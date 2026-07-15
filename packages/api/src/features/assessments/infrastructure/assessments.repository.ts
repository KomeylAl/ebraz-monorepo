import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreatePublicAssessmentInput,
  ListAssessmentsQuery,
  UpdateAssessmentInput,
} from "@ebraz/validation/assessments";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { normalizePhone } from "@ebraz/utils/phone";
import { assessmentInclude, toAssessmentProfile } from "../domain/assessment.mapper";

function buildSearchFilter(search?: string): Prisma.AssessmentAssignmentWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    client: {
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ],
    },
  };
}

function buildListWhere(query: ListAssessmentsQuery): Prisma.InitAssessmentWhereInput {
  const assignmentFilter: Prisma.AssessmentAssignmentWhereInput = {
    ...(query.clientId ? { clientId: query.clientId } : {}),
    ...(query.therapistId ? { therapistId: query.therapistId } : {}),
    ...(buildSearchFilter(query.search) ?? {}),
  };

  return {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.fromDate || query.toDate
      ? {
          date: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
    ...(Object.keys(assignmentFilter).length > 0
      ? { assignment: assignmentFilter }
      : {}),
  };
}

export async function listAssessments(query: ListAssessmentsQuery) {
  const where = buildListWhere(query);
  const { skip, take } = getSkipTake(query);

  const [items, total] = await Promise.all([
    prisma.initAssessment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: assessmentInclude,
    }),
    prisma.initAssessment.count({ where }),
  ]);

  return {
    data: items.map(toAssessmentProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findAssessmentById(id: string) {
  return prisma.initAssessment.findFirst({
    where: { id, deletedAt: null },
    include: assessmentInclude,
  });
}

export async function findTherapistById(id: string) {
  return prisma.therapist.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

async function findOrCreateClient(
  tx: Prisma.TransactionClient,
  name: string,
  phone: string,
) {
  const normalizedPhone = normalizePhone(phone);
  const existing = await tx.client.findFirst({
    where: { phone: normalizedPhone, deletedAt: null },
  });

  if (existing) {
    if (existing.name !== name.trim()) {
      return tx.client.update({
        where: { id: existing.id },
        data: { name: name.trim() },
      });
    }
    return existing;
  }

  return tx.client.create({
    data: {
      name: name.trim(),
      phone: normalizedPhone,
    },
  });
}

export async function createPublicAssessmentRecord(input: CreatePublicAssessmentInput) {
  const status = input.status ?? "pending";

  return prisma.$transaction(async (tx) => {
    const client = await findOrCreateClient(tx, input.client.name, input.client.phone);

    if (input.therapistId) {
      const therapist = await tx.therapist.findFirst({
        where: { id: input.therapistId, deletedAt: null },
        select: { id: true },
      });
      if (!therapist) return null;
    }

    const assessment = await tx.initAssessment.create({
      data: {
        date: input.date,
        time: input.time,
        status,
        assignment: {
          create: {
            clientId: client.id,
            therapistId: input.therapistId,
          },
        },
      },
      include: assessmentInclude,
    });

    return toAssessmentProfile(assessment);
  });
}

export async function updateAssessmentRecord(
  id: string,
  input: UpdateAssessmentInput,
  actorId: string,
) {
  const existing = await prisma.initAssessment.findFirst({
    where: { id, deletedAt: null },
    include: { assignment: true },
  });
  if (!existing?.assignment) return null;

  if (input.therapistId) {
    const therapist = await findTherapistById(input.therapistId);
    if (!therapist) return "THERAPIST_NOT_FOUND" as const;
  }

  const assessment = await prisma.$transaction(async (tx) => {
    if (input.therapistId !== undefined) {
      await tx.assessmentAssignment.update({
        where: { initAssessmentId: id },
        data: { therapistId: input.therapistId },
      });
    }

    return tx.initAssessment.update({
      where: { id },
      data: {
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.time !== undefined ? { time: input.time } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.filePath !== undefined ? { filePath: input.filePath } : {}),
        updatedBy: actorId,
      },
      include: assessmentInclude,
    });
  });

  return toAssessmentProfile(assessment);
}

export async function softDeleteAssessmentRecord(id: string, actorId: string) {
  await prisma.initAssessment.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: actorId,
    },
  });
}
