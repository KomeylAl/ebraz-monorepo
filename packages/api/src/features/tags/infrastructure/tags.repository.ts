import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateTagInput,
  ListTagsQuery,
  UpdateTagInput,
} from "@ebraz/validation/cms/tags";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { buildTagData, tagInclude, toTagProfile } from "../domain/tag.mapper";

function buildSearchFilter(search?: string): Prisma.TagWhereInput | undefined {
  if (!search?.trim()) return undefined;
  const term = search.trim();
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listTags(query: ListTagsQuery) {
  const where: Prisma.TagWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: tagInclude,
    }),
    prisma.tag.count({ where }),
  ]);
  return {
    data: items.map(toTagProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findTagById(id: string) {
  return prisma.tag.findFirst({
    where: { id, deletedAt: null },
    include: tagInclude,
  });
}

export async function findTagBySlug(slug: string, excludeId?: string) {
  return prisma.tag.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function findTagsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.tag.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true },
  });
}

export async function createTagRecord(input: CreateTagInput, actorId: string) {
  const tag = await prisma.tag.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      excerpt: input.excerpt,
      content: input.content,
      image: input.image,
      createdBy: actorId,
      updatedBy: actorId,
    },
    include: tagInclude,
  });
  return toTagProfile(tag);
}

export async function updateTagRecord(id: string, input: UpdateTagInput, actorId: string) {
  const tag = await prisma.tag.update({
    where: { id },
    data: buildTagData(input, actorId),
    include: tagInclude,
  });
  return toTagProfile(tag);
}

export async function softDeleteTagRecord(id: string, actorId: string) {
  await prisma.tag.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: actorId },
  });
}
