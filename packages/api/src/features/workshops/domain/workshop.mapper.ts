import type { Prisma } from "@ebraz/database";
import type {
  ParticipantProfile,
  WorkshopListItem,
  WorkshopParticipantProfile,
  WorkshopProfile,
  WorkshopPublicProfile,
  WorkshopSessionProfile,
} from "@ebraz/types/workshops";
import { toISODate } from "@ebraz/utils/date";
import { normalizePhone } from "@ebraz/utils/phone";

export const workshopDetailInclude = {
  sessions: {
    where: { deletedAt: null },
    orderBy: { sessionDate: "asc" as const },
  },
  participants: {
    include: {
      participant: true,
    },
    orderBy: { registeredAt: "desc" as const },
  },
} satisfies Prisma.WorkshopInclude;

type WorkshopRecord = Prisma.WorkshopGetPayload<{
  include: typeof workshopDetailInclude;
}>;

type SessionRecord = Prisma.WorkshopSessionGetPayload<Record<string, never>>;
type ParticipantRecord = Prisma.ParticipantGetPayload<Record<string, never>>;

export function toWorkshopSessionProfile(session: SessionRecord): WorkshopSessionProfile {
  return {
    id: session.id,
    workshopId: session.workshopId,
    title: session.title,
    description: session.description,
    sessionDate: session.sessionDate ? toISODate(session.sessionDate) : undefined,
    startTime: session.startTime,
    endTime: session.endTime,
    location: session.location ?? undefined,
    link: session.link ?? undefined,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function toWorkshopListItem(workshop: Prisma.WorkshopGetPayload<Record<string, never>>): WorkshopListItem {
  return {
    id: workshop.id,
    title: workshop.title,
    slug: workshop.slug,
    excerpt: workshop.excerpt ?? undefined,
    organizers: workshop.organizers ?? undefined,
    startDate: workshop.startDate ? toISODate(workshop.startDate) : undefined,
    endDate: workshop.endDate ? toISODate(workshop.endDate) : undefined,
    weekDay: workshop.weekDay ?? undefined,
    time: workshop.time ?? undefined,
    imgPath: workshop.imgPath ?? undefined,
    createdAt: workshop.createdAt.toISOString(),
    updatedAt: workshop.updatedAt.toISOString(),
  };
}

function toWorkshopParticipantProfile(
  enrollment: WorkshopRecord["participants"][number],
): WorkshopParticipantProfile {
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

export function toWorkshopProfile(workshop: WorkshopRecord): WorkshopProfile {
  return {
    ...toWorkshopListItem(workshop),
    content: workshop.content,
    sessions: workshop.sessions.map(toWorkshopSessionProfile),
    participants: workshop.participants.map(toWorkshopParticipantProfile),
  };
}

export function toWorkshopPublicProfile(workshop: WorkshopRecord): WorkshopPublicProfile {
  return {
    ...toWorkshopListItem(workshop),
    content: workshop.content,
    sessions: workshop.sessions.map(toWorkshopSessionProfile),
  };
}

export function toParticipantProfile(participant: ParticipantRecord): ParticipantProfile {
  return {
    id: participant.id,
    name: participant.name,
    nameEn: participant.nameEn ?? undefined,
    nationalCode: participant.nationalCode ?? undefined,
    phone: participant.phone,
    gender: participant.gender,
    approved: participant.approved,
    createdAt: participant.createdAt.toISOString(),
    updatedAt: participant.updatedAt.toISOString(),
  };
}

export function buildWorkshopData(
  input: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string | null;
    organizers?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    weekDay?: string | null;
    time?: string | null;
    imgPath?: string | null;
  },
  actorId: string,
) {
  return {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
    ...(input.organizers !== undefined ? { organizers: input.organizers } : {}),
    ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
    ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
    ...(input.weekDay !== undefined ? { weekDay: input.weekDay } : {}),
    ...(input.time !== undefined ? { time: input.time } : {}),
    ...(input.imgPath !== undefined ? { imgPath: input.imgPath } : {}),
    updatedBy: actorId,
  };
}

export function normalizeParticipantPhone(phone: string) {
  return normalizePhone(phone);
}

export function isRegistrationOpen(endDate: Date | null | undefined) {
  if (!endDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(endDate);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff >= today;
}
