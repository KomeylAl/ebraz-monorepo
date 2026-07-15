import type { Prisma } from "@ebraz/database";
import type { PostProfile, PostPublicProfile } from "@ebraz/types/cms";

export const postInclude = {
  admin: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.PostInclude;

type PostRecord = Prisma.PostGetPayload<{ include: typeof postInclude }>;

function mapTags(post: PostRecord) {
  return post.tags.map(({ tag }) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }));
}

export function toPostProfile(post: PostRecord): PostProfile {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    content: post.content,
    thumbnail: post.thumbnail ?? undefined,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString(),
    author: { id: post.admin.id, name: post.admin.name },
    category: post.category
      ? { id: post.category.id, name: post.category.name, slug: post.category.slug }
      : undefined,
    tags: mapTags(post),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function toPostPublicProfile(post: PostRecord): PostPublicProfile {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    content: post.content,
    thumbnail: post.thumbnail ?? undefined,
    publishedAt: post.publishedAt?.toISOString(),
    category: post.category
      ? { id: post.category.id, name: post.category.name, slug: post.category.slug }
      : undefined,
    tags: mapTags(post),
  };
}

export function resolvePublishedAt(
  status: "draft" | "published" | "archived",
  publishedAt?: Date | null,
) {
  if (status === "published") {
    return publishedAt ?? new Date();
  }
  return publishedAt ?? null;
}
