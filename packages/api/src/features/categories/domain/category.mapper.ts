import type { Prisma } from "@ebraz/database";
import type { CategoryProfile } from "@ebraz/types/cms";

export const categoryInclude = {} satisfies Prisma.CategoryInclude;

type CategoryRecord = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;

export function toCategoryProfile(category: CategoryRecord): CategoryProfile {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    excerpt: category.excerpt ?? undefined,
    content: category.content,
    image: category.image ?? undefined,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function buildCategoryData(
  input: {
    name?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    image?: string | null;
  },
  actorId: string,
) {
  return {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.image !== undefined ? { image: input.image } : {}),
    updatedBy: actorId,
  };
}
