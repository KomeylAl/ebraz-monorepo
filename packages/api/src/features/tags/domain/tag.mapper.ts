import type { Prisma } from "@ebraz/database";
import type { TagProfile } from "@ebraz/types/cms";

export const tagInclude = {} satisfies Prisma.TagInclude;

type TagRecord = Prisma.TagGetPayload<{ include: typeof tagInclude }>;

export function toTagProfile(tag: TagRecord): TagProfile {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    excerpt: tag.excerpt ?? undefined,
    content: tag.content,
    image: tag.image ?? undefined,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

export function buildTagData(
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
