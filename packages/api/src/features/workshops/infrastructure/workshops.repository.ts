import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateWorkshopInput,
  CreateWorkshopSessionInput,
  ListWorkshopsQuery,
  ParticipantInput,
  UpdateParticipantInput,
  UpdateWorkshopInput,
  UpdateWorkshopSessionInput,
} from "@ebraz/validation/workshops";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import {
  buildWorkshopData,
  normalizeParticipantPhone,
  toParticipantProfile,
  toWorkshopListItem,
  toWorkshopProfile,
  toWorkshopPublicProfile,
  toWorkshopSessionProfile,
  workshopDetailInclude,
} from "../domain/workshop.mapper";

function buildSearchFilter(search?: string): Prisma.WorkshopWhereInput | undefined {
  if (!search?.trim()) return undefined;
  const term = search.trim();
  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { organizers: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listWorkshops(query: ListWorkshopsQuery) {
  const where: Prisma.WorkshopWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.workshop.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.workshop.count({ where }),
  ]);
  return {
    data: items.map(toWorkshopListItem),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findWorkshopById(id: string) {
  return prisma.workshop.findFirst({
    where: { id, deletedAt: null },
    include: workshopDetailInclude,
  });
}

export async function findWorkshopBySlug(slug: string, excludeId?: string) {
  return prisma.workshop.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function createWorkshopRecord(input: CreateWorkshopInput, actorId: string) {
  const workshop = await prisma.workshop.create({
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      content: input.content,
      excerpt: input.excerpt,
      organizers: input.organizers,
      startDate: input.startDate,
      endDate: input.endDate,
      weekDay: input.weekDay,
      time: input.time,
      imgPath: input.imgPath,
      createdBy: actorId,
      updatedBy: actorId,
    },
    include: workshopDetailInclude,
  });
  return toWorkshopProfile(workshop);
}

export async function updateWorkshopRecord(
  id: string,
  input: UpdateWorkshopInput,
  actorId: string,
) {
  const workshop = await prisma.workshop.update({
    where: { id },
    data: buildWorkshopData(input, actorId),
    include: workshopDetailInclude,
  });
  return toWorkshopProfile(workshop);
}

export async function softDeleteWorkshopRecord(id: string, actorId: string) {
  await prisma.$transaction([
    prisma.workshopSession.updateMany({
      where: { workshopId: id, deletedAt: null },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
    prisma.workshop.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
  ]);
}

export async function createSessionRecord(
  workshopId: string,
  input: CreateWorkshopSessionInput,
  actorId: string,
) {
  const session = await prisma.workshopSession.create({
    data: {
      workshopId,
      title: input.title.trim(),
      description: input.description,
      sessionDate: input.sessionDate,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location,
      link: input.link,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });
  return toWorkshopSessionProfile(session);
}

export async function findSessionById(workshopId: string, sessionId: string) {
  return prisma.workshopSession.findFirst({
    where: { id: sessionId, workshopId, deletedAt: null },
  });
}

export async function updateSessionRecord(
  sessionId: string,
  input: UpdateWorkshopSessionInput,
  actorId: string,
) {
  const session = await prisma.workshopSession.update({
    where: { id: sessionId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.sessionDate !== undefined ? { sessionDate: input.sessionDate } : {}),
      ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
      ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.link !== undefined ? { link: input.link } : {}),
      updatedBy: actorId,
    },
  });
  return toWorkshopSessionProfile(session);
}

export async function softDeleteSessionRecord(sessionId: string, actorId: string) {
  await prisma.workshopSession.update({
    where: { id: sessionId },
    data: { deletedAt: new Date(), deletedBy: actorId },
  });
}

async function findOrCreateParticipant(input: ParticipantInput, actorId?: string) {
  const phone = normalizeParticipantPhone(input.phone);
  const existing = await prisma.participant.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { phone },
        ...(input.nationalCode ? [{ nationalCode: input.nationalCode }] : []),
      ],
    },
  });

  if (existing) {
    const participant = await prisma.participant.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim(),
        nameEn: input.nameEn,
        nationalCode: input.nationalCode ?? existing.nationalCode,
        phone,
        gender: input.gender,
        ...(input.approved !== undefined ? { approved: input.approved } : {}),
        updatedBy: actorId,
      },
    });
    return participant;
  }

  return prisma.participant.create({
    data: {
      name: input.name.trim(),
      nameEn: input.nameEn,
      nationalCode: input.nationalCode,
      phone,
      gender: input.gender,
      approved: input.approved ?? false,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });
}

export async function enrollParticipant(
  workshopId: string,
  input: ParticipantInput,
  actorId?: string,
) {
  const participant = await findOrCreateParticipant(input, actorId);
  const enrollment = await prisma.participantWorkshop.upsert({
    where: {
      participantId_workshopId: {
        participantId: participant.id,
        workshopId,
      },
    },
    update: {},
    create: {
      participantId: participant.id,
      workshopId,
      approved: input.approved ?? false,
      registeredAt: new Date(),
    },
    include: { participant: true },
  });

  return {
    participantId: enrollment.participantId,
    workshopId: enrollment.workshopId,
    name: enrollment.participant.name,
    nameEn: enrollment.participant.nameEn ?? undefined,
    nationalCode: enrollment.participant.nationalCode ?? undefined,
    phone: enrollment.participant.phone,
    gender: enrollment.participant.gender,
    approved: enrollment.approved,
    joinedAt: enrollment.joinedAt?.toISOString(),
    registeredAt: enrollment.registeredAt.toISOString(),
  };
}

export async function findEnrollment(workshopId: string, participantId: string) {
  return prisma.participantWorkshop.findUnique({
    where: {
      participantId_workshopId: { participantId, workshopId },
    },
    include: { participant: true },
  });
}

export async function updateEnrollmentParticipant(
  workshopId: string,
  participantId: string,
  input: UpdateParticipantInput,
  actorId: string,
) {
  const enrollment = await findEnrollment(workshopId, participantId);
  if (!enrollment) return null;

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.nationalCode !== undefined ? { nationalCode: input.nationalCode } : {}),
      ...(input.phone !== undefined ? { phone: normalizeParticipantPhone(input.phone) } : {}),
      ...(input.gender !== undefined ? { gender: input.gender } : {}),
      ...(input.approved !== undefined ? { approved: input.approved } : {}),
      updatedBy: actorId,
    },
  });

  if (input.approved !== undefined) {
    await prisma.participantWorkshop.update({
      where: {
        participantId_workshopId: { participantId, workshopId },
      },
      data: {
        approved: input.approved,
        joinedAt: input.approved ? new Date() : null,
      },
    });
  }

  const refreshed = await findEnrollment(workshopId, participantId);
  if (!refreshed) return null;

  return {
    participantId: refreshed.participantId,
    workshopId: refreshed.workshopId,
    name: refreshed.participant.name,
    nameEn: refreshed.participant.nameEn ?? undefined,
    nationalCode: refreshed.participant.nationalCode ?? undefined,
    phone: refreshed.participant.phone,
    gender: refreshed.participant.gender,
    approved: refreshed.approved,
    joinedAt: refreshed.joinedAt?.toISOString(),
    registeredAt: refreshed.registeredAt.toISOString(),
  };
}

export async function setEnrollmentApproval(
  workshopId: string,
  participantId: string,
  approved: boolean,
) {
  const enrollment = await findEnrollment(workshopId, participantId);
  if (!enrollment) return null;

  const updated = await prisma.participantWorkshop.update({
    where: {
      participantId_workshopId: { participantId, workshopId },
    },
    data: {
      approved,
      joinedAt: approved ? new Date() : null,
    },
    include: { participant: true },
  });

  return {
    participantId: updated.participantId,
    workshopId: updated.workshopId,
    name: updated.participant.name,
    nameEn: updated.participant.nameEn ?? undefined,
    nationalCode: updated.participant.nationalCode ?? undefined,
    phone: updated.participant.phone,
    gender: updated.participant.gender,
    approved: updated.approved,
    joinedAt: updated.joinedAt?.toISOString(),
    registeredAt: updated.registeredAt.toISOString(),
  };
}

export async function removeEnrollment(workshopId: string, participantId: string) {
  await prisma.participantWorkshop.delete({
    where: {
      participantId_workshopId: { participantId, workshopId },
    },
  });
}

export function mapWorkshopPublic(workshop: NonNullable<Awaited<ReturnType<typeof findWorkshopById>>>) {
  return toWorkshopPublicProfile(workshop);
}

export function mapWorkshopAdmin(workshop: NonNullable<Awaited<ReturnType<typeof findWorkshopById>>>) {
  return toWorkshopProfile(workshop);
}

export { toParticipantProfile };
