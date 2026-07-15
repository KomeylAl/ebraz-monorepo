import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateTherapistResourceInput,
  ListTherapistPanelQuery,
  UpdateTherapistResourceInput,
  UpsertTherapistResumeInput,
} from "@ebraz/validation/therapist-panel";
import { addDays, startOfDay, toISODate } from "@ebraz/utils/date";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { appointmentInclude, toAppointmentProfile } from "@/features/appointments/domain/appointment.mapper";
import { assessmentInclude, toAssessmentProfile } from "@/features/assessments/domain/assessment.mapper";
import { toClientProfile } from "@/features/clients/domain/client.mapper";
import { toMedicalRecordProfile, medicalRecordInclude } from "@/features/medical-records/domain/medical-record.mapper";
import { buildUnreadWhere } from "@/features/notifications/domain/notification.mapper";
import {
  emptyTherapistResumeProfile,
  toTherapistResourceProfile,
  toTherapistResumeProfile,
} from "../domain/therapist-panel.mapper";

function buildAppointmentSearchFilter(search?: string): Prisma.AppointmentWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    OR: [
      { time: { contains: term, mode: "insensitive" } },
      { client: { name: { contains: term, mode: "insensitive" } } },
      { client: { phone: { contains: term, mode: "insensitive" } } },
    ],
  };
}

export async function getTherapistDashboardStats(therapistId: string) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const sevenDaysEnd = addDays(today, 7);
  const thirtyDaysEnd = addDays(today, 30);

  const baseWhere = { therapistId, deletedAt: null };

  const [
    appointmentsToday,
    appointmentsTomorrow,
    appointmentsNext7Days,
    appointmentsNext30Days,
    unreadNotifications,
    pendingAssessments,
    clientIdsFromAppointments,
    clientIdsFromAssessments,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { ...baseWhere, date: today } }),
    prisma.appointment.count({ where: { ...baseWhere, date: tomorrow } }),
    prisma.appointment.count({
      where: { ...baseWhere, date: { gte: today, lte: sevenDaysEnd } },
    }),
    prisma.appointment.count({
      where: { ...baseWhere, date: { gte: today, lte: thirtyDaysEnd } },
    }),
    prisma.notification.count({
      where: buildUnreadWhere("THERAPIST", therapistId),
    }),
    prisma.initAssessment.count({
      where: {
        deletedAt: null,
        status: "pending",
        assignment: { therapistId },
      },
    }),
    prisma.appointment.findMany({
      where: baseWhere,
      select: { clientId: true },
      distinct: ["clientId"],
    }),
    prisma.assessmentAssignment.findMany({
      where: { therapistId },
      select: { clientId: true },
      distinct: ["clientId"],
    }),
    prisma.appointment.findMany({
      where: baseWhere,
      take: 5,
      orderBy: [{ date: "desc" }, { time: "desc" }],
      include: {
        client: { select: { id: true, name: true, phone: true } },
      },
    }),
  ]);

  const totalClients = new Set([
    ...clientIdsFromAppointments.map((row) => row.clientId),
    ...clientIdsFromAssessments.map((row) => row.clientId),
  ]).size;

  return {
    appointmentsToday,
    appointmentsTomorrow,
    appointmentsNext7Days,
    appointmentsNext30Days,
    unreadNotifications,
    pendingAssessments,
    totalClients,
    recentAppointments: recentAppointments.map((appointment) => ({
      id: appointment.id,
      date: toISODate(appointment.date),
      time: appointment.time,
      status: appointment.status,
      client: appointment.client,
    })),
  };
}

export async function listTherapistAppointments(
  therapistId: string,
  query: ListTherapistPanelQuery,
  date?: Date,
) {
  const where: Prisma.AppointmentWhereInput = {
    therapistId,
    deletedAt: null,
    ...(date ? { date } : {}),
    ...(buildAppointmentSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take,
      orderBy: [{ date: "desc" }, { time: "desc" }],
      include: appointmentInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: items.map(toAppointmentProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function listTherapistAppointmentsInRange(
  therapistId: string,
  fromDate: Date,
  toDate: Date,
  query: ListTherapistPanelQuery,
) {
  const where: Prisma.AppointmentWhereInput = {
    therapistId,
    deletedAt: null,
    date: { gte: fromDate, lte: toDate },
    ...(buildAppointmentSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take,
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: appointmentInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: items.map(toAppointmentProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

function buildAssessmentSearchFilter(search?: string): Prisma.AssessmentAssignmentWhereInput | undefined {
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

export async function listTherapistAssessments(
  therapistId: string,
  query: ListTherapistPanelQuery,
  date?: Date,
) {
  const where: Prisma.InitAssessmentWhereInput = {
    deletedAt: null,
    ...(date ? { date } : {}),
    assignment: {
      therapistId,
      ...(buildAssessmentSearchFilter(query.search) ?? {}),
    },
  };

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

export async function findTherapistResume(therapistId: string) {
  const resume = await prisma.therapistResume.findUnique({
    where: { therapistId },
  });
  return resume ? toTherapistResumeProfile(resume) : emptyTherapistResumeProfile(therapistId);
}

export async function upsertTherapistResumeRecord(
  therapistId: string,
  input: UpsertTherapistResumeInput,
) {
  const resume = await prisma.therapistResume.upsert({
    where: { therapistId },
    update: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.specialization !== undefined ? { specialization: input.specialization } : {}),
      ...(input.educations !== undefined
        ? { educations: input.educations as Prisma.InputJsonValue }
        : {}),
      ...(input.experiences !== undefined
        ? { experiences: input.experiences as Prisma.InputJsonValue }
        : {}),
      ...(input.skills !== undefined ? { skills: input.skills as Prisma.InputJsonValue } : {}),
      ...(input.certifications !== undefined
        ? { certifications: input.certifications as Prisma.InputJsonValue }
        : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.socialLinks !== undefined
        ? { socialLinks: input.socialLinks as Prisma.InputJsonValue }
        : {}),
      ...(input.filePath !== undefined ? { filePath: input.filePath } : {}),
    },
    create: {
      therapistId,
      title: input.title,
      bio: input.bio,
      specialization: input.specialization,
      educations: (input.educations ?? []) as Prisma.InputJsonValue,
      experiences: (input.experiences ?? []) as Prisma.InputJsonValue,
      skills: (input.skills ?? []) as Prisma.InputJsonValue,
      certifications: (input.certifications ?? []) as Prisma.InputJsonValue,
      content: input.content,
      socialLinks: (input.socialLinks ?? null) as Prisma.InputJsonValue,
      filePath: input.filePath,
    },
  });

  return toTherapistResumeProfile(resume);
}

export async function listTherapistResources(therapistId: string, query: ListTherapistPanelQuery) {
  const where: Prisma.TherapistResourceWhereInput = {
    therapistId,
    ...(query.search?.trim()
      ? {
          OR: [
            { title: { contains: query.search.trim(), mode: "insensitive" } },
            { description: { contains: query.search.trim(), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.therapistResource.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.therapistResource.count({ where }),
  ]);

  return {
    data: items.map(toTherapistResourceProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findTherapistResourceById(therapistId: string, id: string) {
  return prisma.therapistResource.findFirst({
    where: { id, therapistId },
  });
}

export async function createTherapistResourceRecord(
  therapistId: string,
  input: CreateTherapistResourceInput,
) {
  const resource = await prisma.therapistResource.create({
    data: {
      therapistId,
      title: input.title.trim(),
      type: input.type,
      description: input.description,
      link: input.type === "link" ? input.link : null,
      filePath: input.type === "file" ? input.filePath : null,
    },
  });

  return toTherapistResourceProfile(resource);
}

export async function updateTherapistResourceRecord(
  therapistId: string,
  id: string,
  input: UpdateTherapistResourceInput,
) {
  const existing = await findTherapistResourceById(therapistId, id);
  if (!existing) return null;

  const nextType = input.type ?? existing.type;
  const resource = await prisma.therapistResource.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.link !== undefined ? { link: input.link } : {}),
      ...(input.filePath !== undefined ? { filePath: input.filePath } : {}),
      ...(nextType === "link" ? { filePath: null } : {}),
      ...(nextType === "file" ? { link: null } : {}),
    },
  });

  return toTherapistResourceProfile(resource);
}

export async function deleteTherapistResourceRecord(therapistId: string, id: string) {
  const existing = await findTherapistResourceById(therapistId, id);
  if (!existing) return false;
  await prisma.therapistResource.delete({ where: { id } });
  return true;
}

export async function therapistExists(id: string) {
  return prisma.therapist.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

async function getTherapistClientIds(therapistId: string): Promise<string[]> {
  const [fromAppointments, fromAssessments, fromRecords] = await Promise.all([
    prisma.appointment.findMany({
      where: { therapistId, deletedAt: null },
      select: { clientId: true },
      distinct: ["clientId"],
    }),
    prisma.assessmentAssignment.findMany({
      where: { therapistId },
      select: { clientId: true },
      distinct: ["clientId"],
    }),
    prisma.medicalRecord.findMany({
      where: {
        deletedAt: null,
        OR: [{ therapistId }, { supervisorId: therapistId }],
      },
      select: { clientId: true },
    }),
  ]);

  return [
    ...new Set([
      ...fromAppointments.map((row) => row.clientId),
      ...fromAssessments.map((row) => row.clientId),
      ...fromRecords.map((row) => row.clientId),
    ]),
  ];
}

export async function therapistHasAccessToClient(therapistId: string, clientId: string) {
  const ids = await getTherapistClientIds(therapistId);
  return ids.includes(clientId);
}

export async function listTherapistClients(therapistId: string, query: ListTherapistPanelQuery) {
  const clientIds = await getTherapistClientIds(therapistId);
  if (clientIds.length === 0) {
    return {
      data: [],
      meta: buildPaginationMeta(0, query.page, query.pageSize),
    };
  }

  const search = query.search?.trim();

  const where: Prisma.ClientWhereInput = {
    id: { in: clientIds },
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data: items.map(toClientProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findTherapistClient(therapistId: string, clientId: string) {
  const hasAccess = await therapistHasAccessToClient(therapistId, clientId);
  if (!hasAccess) return null;

  const client = await prisma.client.findFirst({
    where: { id: clientId, deletedAt: null },
  });
  return client ? toClientProfile(client) : null;
}

export async function findTherapistClientMedicalRecord(therapistId: string, clientId: string) {
  const hasAccess = await therapistHasAccessToClient(therapistId, clientId);
  if (!hasAccess) return null;

  const record = await prisma.medicalRecord.findFirst({
    where: { clientId, deletedAt: null },
    include: medicalRecordInclude,
  });
  return record ? toMedicalRecordProfile(record) : null;
}
