import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "@ebraz/validation/cms/categories";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import {
  buildCategoryData,
  categoryInclude,
  toCategoryProfile,
} from "../domain/category.mapper";

function buildSearchFilter(search?: string): Prisma.CategoryWhereInput | undefined {
  if (!search?.trim()) return undefined;
  const term = search.trim();
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listCategories(query: ListCategoriesQuery) {
  const where: Prisma.CategoryWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: categoryInclude,
    }),
    prisma.category.count({ where }),
  ]);
  return {
    data: items.map(toCategoryProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, deletedAt: null },
    include: categoryInclude,
  });
}

export async function findCategoryBySlugExcluding(slug: string, excludeId: string) {
  return prisma.category.findFirst({
    where: { slug, deletedAt: null, NOT: { id: excludeId } },
  });
}

export async function createCategoryRecord(input: CreateCategoryInput, actorId: string) {
  const category = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      excerpt: input.excerpt,
      content: input.content,
      image: input.image,
      createdBy: actorId,
      updatedBy: actorId,
    },
    include: categoryInclude,
  });
  return toCategoryProfile(category);
}

export async function updateCategoryRecord(
  id: string,
  input: UpdateCategoryInput,
  actorId: string,
) {
  const category = await prisma.category.update({
    where: { id },
    data: buildCategoryData(input, actorId),
    include: categoryInclude,
  });
  return toCategoryProfile(category);
}

export async function softDeleteCategoryRecord(id: string, actorId: string) {
  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: actorId },
  });
}
