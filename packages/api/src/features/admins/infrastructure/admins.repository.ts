import { prisma, type Prisma } from "@ebraz/database";
import type { AdminSubRole } from "@ebraz/types";
import type { CreateAdminInput, ListAdminsQuery, UpdateAdminInput } from "@ebraz/validation/admins";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { normalizePhone } from "@ebraz/utils/phone";
import { toAdminProfile } from "../domain/admin.mapper";

function buildSearchFilter(search?: string): Prisma.AdminWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listAdmins(query: ListAdminsQuery) {
  const where: Prisma.AdminWhereInput = {
    deletedAt: null,
    ...(query.subRole ? { subRole: query.subRole } : {}),
    ...(buildSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.admin.count({ where }),
  ]);

  return {
    data: items.map(toAdminProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function listReceptionAdmins() {
  const items = await prisma.admin.findMany({
    where: { deletedAt: null, subRole: "receptionist" },
    orderBy: { name: "asc" },
  });

  return items.map(toAdminProfile);
}

export async function findAdminById(id: string) {
  return prisma.admin.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function findAdminByPhone(phone: string, excludeId?: string) {
  const normalizedPhone = normalizePhone(phone);
  return prisma.admin.findFirst({
    where: {
      phone: normalizedPhone,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function createAdminRecord(
  input: CreateAdminInput,
  passwordHash: string,
  actorId: string,
) {
  const admin = await prisma.admin.create({
    data: {
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      subRole: input.subRole as AdminSubRole,
      birthDate: input.birthDate,
      password: passwordHash,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  return toAdminProfile(admin);
}

export async function updateAdminRecord(
  id: string,
  input: UpdateAdminInput,
  actorId: string,
  passwordHash?: string,
) {
  const admin = await prisma.admin.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
      ...(input.subRole !== undefined ? { subRole: input.subRole } : {}),
      ...(input.birthDate !== undefined ? { birthDate: input.birthDate } : {}),
      ...(passwordHash ? { password: passwordHash } : {}),
      updatedBy: actorId,
    },
  });

  return toAdminProfile(admin);
}

export async function softDeleteAdminRecord(id: string, actorId: string) {
  await prisma.admin.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: actorId,
    },
  });
}
