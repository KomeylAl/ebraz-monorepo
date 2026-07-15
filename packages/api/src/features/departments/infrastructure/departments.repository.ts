import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateDepartmentInput,
  ListDepartmentsQuery,
  UpdateDepartmentInput,
} from "@ebraz/validation/cms/departments";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import {
  buildDepartmentData,
  departmentInclude,
  toDepartmentProfile,
  toDepartmentPublicProfile,
} from "../domain/department.mapper";

function buildSearchFilter(search?: string): Prisma.DepartmentWhereInput | undefined {
  if (!search?.trim()) return undefined;
  const term = search.trim();
  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listDepartments(query: ListDepartmentsQuery) {
  const where: Prisma.DepartmentWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.department.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: departmentInclude,
    }),
    prisma.department.count({ where }),
  ]);
  return {
    data: items.map(toDepartmentProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function listPublicDepartments(query: ListDepartmentsQuery) {
  const result = await listDepartments(query);
  return {
    data: result.data.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      thumbnail: item.thumbnail,
    })),
    meta: result.meta,
  };
}

export async function findDepartmentBySlug(slug: string) {
  return prisma.department.findFirst({
    where: { slug, deletedAt: null },
    include: departmentInclude,
  });
}

export async function findDepartmentBySlugExcluding(slug: string, excludeId: string) {
  return prisma.department.findFirst({
    where: { slug, deletedAt: null, NOT: { id: excludeId } },
  });
}

export async function findTherapistsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.therapist.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true },
  });
}

async function syncTherapists(
  tx: Prisma.TransactionClient,
  departmentId: string,
  therapistIds: string[] | undefined,
) {
  if (therapistIds === undefined) return;
  await tx.departmentTherapist.deleteMany({ where: { departmentId } });
  if (therapistIds.length === 0) return;
  await tx.departmentTherapist.createMany({
    data: therapistIds.map((therapistId) => ({ departmentId, therapistId })),
  });
}

export async function createDepartmentRecord(
  input: CreateDepartmentInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const department = await tx.department.create({
      data: {
        title: input.title.trim(),
        slug: input.slug.trim(),
        excerpt: input.excerpt,
        content: input.content,
        thumbnail: input.thumbnail,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
    await syncTherapists(tx, department.id, input.therapistIds);
    const refreshed = await tx.department.findFirstOrThrow({
      where: { id: department.id },
      include: departmentInclude,
    });
    return toDepartmentProfile(refreshed);
  });
}

export async function updateDepartmentRecord(
  id: string,
  input: UpdateDepartmentInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.department.update({
      where: { id },
      data: buildDepartmentData(input, actorId),
    });
    await syncTherapists(tx, id, input.therapistIds);
    const refreshed = await tx.department.findFirstOrThrow({
      where: { id },
      include: departmentInclude,
    });
    return toDepartmentProfile(refreshed);
  });
}

export async function softDeleteDepartmentRecord(id: string, actorId: string) {
  await prisma.$transaction([
    prisma.departmentTherapist.deleteMany({ where: { departmentId: id } }),
    prisma.department.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    }),
  ]);
}
