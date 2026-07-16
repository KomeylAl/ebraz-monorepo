import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateTherapistInput,
  ListTherapistsQuery,
  UpdateTherapistInput,
} from "@ebraz/validation/therapists";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { normalizePhone } from "@ebraz/utils/phone";
import { toTherapistProfile, toTherapistPublicProfile } from "../domain/therapist.mapper";
import { TherapistError } from "../domain/therapists.errors";

function buildSearchFilter(search?: string): Prisma.TherapistWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { nationalCode: { contains: term, mode: "insensitive" } },
    ],
  };
}

const therapistListOrderBy: Prisma.TherapistOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { name: "asc" },
];

export async function listTherapists(query: ListTherapistsQuery) {
  const where: Prisma.TherapistWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.therapist.findMany({
      where,
      skip,
      take,
      orderBy: therapistListOrderBy,
    }),
    prisma.therapist.count({ where }),
  ]);

  return {
    data: items.map(toTherapistProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function listPublicTherapists(query: ListTherapistsQuery) {
  const where: Prisma.TherapistWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.therapist.findMany({
      where,
      skip,
      take,
      orderBy: therapistListOrderBy,
    }),
    prisma.therapist.count({ where }),
  ]);

  return {
    data: items.map(toTherapistPublicProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findTherapistById(id: string) {
  return prisma.therapist.findFirst({
    where: { id, deletedAt: null },
  });
}

const publicTherapistDetailInclude = {
  therapistResume: true,
  resources: {
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.TherapistInclude;

export type PublicTherapistDetail = Prisma.TherapistGetPayload<{
  include: typeof publicTherapistDetailInclude;
}>;

export async function findPublicTherapistDetail(
  id: string,
): Promise<PublicTherapistDetail | null> {
  return prisma.therapist.findFirst({
    where: { id, deletedAt: null },
    include: publicTherapistDetailInclude,
  });
}

export async function findTherapistByPhone(phone: string, excludeId?: string) {
  return prisma.therapist.findFirst({
    where: {
      phone: normalizePhone(phone),
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function findTherapistByNationalCode(
  nationalCode: string,
  excludeId?: string,
) {
  return prisma.therapist.findFirst({
    where: {
      nationalCode,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function findTherapistByCardNumber(
  cardNumber: string,
  excludeId?: string,
) {
  return prisma.therapist.findFirst({
    where: {
      cardNumber,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function findTherapistByMedicalNumber(
  medicalNumber: string,
  excludeId?: string,
) {
  return prisma.therapist.findFirst({
    where: {
      medicalNumber,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

async function nextSortOrder() {
  const max = await prisma.therapist.aggregate({
    where: { deletedAt: null },
    _max: { sortOrder: true },
  });
  return (max._max.sortOrder ?? -1) + 1;
}

export async function createTherapistRecord(
  input: CreateTherapistInput,
  actorId: string,
  passwordHash?: string,
) {
  const sortOrder = await nextSortOrder();
  const therapist = await prisma.therapist.create({
    data: {
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      nationalCode: input.nationalCode,
      birthDate: input.birthDate,
      cardNumber: input.cardNumber,
      medicalNumber: input.medicalNumber,
      email: input.email,
      avatar: input.avatar,
      times: input.times,
      days: input.days,
      resume: input.resume,
      profilePath: input.profilePath,
      sortOrder,
      password: passwordHash,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  return toTherapistProfile(therapist);
}

export async function reorderTherapists(orderedIds: string[], actorId: string) {
  const active = await prisma.therapist.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  const activeIds = new Set(active.map((t) => t.id));
  if (orderedIds.length !== activeIds.size) {
    throw new TherapistError(
      "Ordered list must include all active therapists",
      "REORDER_MISMATCH",
    );
  }

  for (const id of orderedIds) {
    if (!activeIds.has(id)) {
      throw new TherapistError(
        "Ordered list contains unknown or deleted therapist",
        "REORDER_MISMATCH",
      );
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.therapist.update({
        where: { id },
        data: {
          sortOrder: index,
          updatedBy: actorId,
        },
      }),
    ),
  );

  return { message: "Therapists reordered" };
}

export async function updateTherapistRecord(
  id: string,
  input: UpdateTherapistInput,
  actorId: string,
) {
  const therapist = await prisma.therapist.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
      ...(input.nationalCode !== undefined ? { nationalCode: input.nationalCode } : {}),
      ...(input.birthDate !== undefined ? { birthDate: input.birthDate } : {}),
      ...(input.cardNumber !== undefined ? { cardNumber: input.cardNumber } : {}),
      ...(input.medicalNumber !== undefined ? { medicalNumber: input.medicalNumber } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
      ...(input.times !== undefined ? { times: input.times } : {}),
      ...(input.days !== undefined ? { days: input.days } : {}),
      ...(input.resume !== undefined ? { resume: input.resume } : {}),
      ...(input.profilePath !== undefined ? { profilePath: input.profilePath } : {}),
      updatedBy: actorId,
    },
  });

  return toTherapistProfile(therapist);
}

export async function updateTherapistAvatarRecord(
  id: string,
  avatar: string,
  actorId: string,
) {
  const therapist = await prisma.therapist.update({
    where: { id },
    data: {
      avatar,
      updatedBy: actorId,
    },
  });

  return toTherapistProfile(therapist);
}

export async function setTherapistPasswordRecord(
  id: string,
  passwordHash: string,
  actorId: string,
) {
  const therapist = await prisma.therapist.update({
    where: { id },
    data: {
      password: passwordHash,
      updatedBy: actorId,
    },
  });

  return toTherapistProfile(therapist);
}

export async function softDeleteTherapistRecord(id: string, actorId: string) {
  await prisma.therapist.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: actorId,
    },
  });
}
