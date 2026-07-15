import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from "@ebraz/validation/cms/posts";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import {
  postInclude,
  resolvePublishedAt,
  toPostProfile,
  toPostPublicProfile,
} from "../domain/post.mapper";

function buildSearchFilter(search?: string): Prisma.PostWhereInput | undefined {
  if (!search?.trim()) return undefined;
  const term = search.trim();
  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { excerpt: { contains: term, mode: "insensitive" } },
    ],
  };
}

function buildListWhere(query: ListPostsQuery, publishedOnly = false): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    ...(publishedOnly ? { status: "published" } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(buildSearchFilter(query.search) ?? {}),
  };
}

export async function listPosts(query: ListPostsQuery, publishedOnly = false) {
  const where = buildListWhere(query, publishedOnly);
  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: postInclude,
    }),
    prisma.post.count({ where }),
  ]);
  return {
    data: publishedOnly ? items.map(toPostPublicProfile) : items.map(toPostProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findPostBySlug(slug: string, publishedOnly = false) {
  return prisma.post.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(publishedOnly ? { status: "published" } : {}),
    },
    include: postInclude,
  });
}

export async function findPostBySlugExcluding(slug: string, excludeId: string) {
  return prisma.post.findFirst({
    where: { slug, deletedAt: null, NOT: { id: excludeId } },
  });
}

export async function findCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
}

export async function findTagsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.tag.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true },
  });
}

async function syncPostTags(
  tx: Prisma.TransactionClient,
  postId: string,
  tagIds: string[] | undefined,
) {
  if (tagIds === undefined) return;
  await tx.postTag.deleteMany({ where: { postId } });
  if (tagIds.length === 0) return;
  await tx.postTag.createMany({
    data: tagIds.map((tagId) => ({ postId, tagId })),
  });
}

export async function createPostRecord(
  input: CreatePostInput,
  actorId: string,
  adminId: string,
) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        adminId,
        categoryId: input.categoryId,
        title: input.title.trim(),
        slug: input.slug.trim(),
        excerpt: input.excerpt,
        content: input.content,
        thumbnail: input.thumbnail,
        status: input.status ?? "draft",
        publishedAt: resolvePublishedAt(input.status ?? "draft", input.publishedAt),
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
    await syncPostTags(tx, post.id, input.tagIds);
    const refreshed = await tx.post.findFirstOrThrow({
      where: { id: post.id },
      include: postInclude,
    });
    return toPostProfile(refreshed);
  });
}

export async function updatePostRecord(
  id: string,
  input: UpdatePostInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.post.findFirstOrThrow({ where: { id } });
    const nextStatus = input.status ?? existing.status;
    await tx.post.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.publishedAt !== undefined || input.status !== undefined
          ? {
              publishedAt: resolvePublishedAt(
                nextStatus,
                input.publishedAt !== undefined ? input.publishedAt : existing.publishedAt,
              ),
            }
          : {}),
        updatedBy: actorId,
      },
    });
    await syncPostTags(tx, id, input.tagIds);
    const refreshed = await tx.post.findFirstOrThrow({
      where: { id },
      include: postInclude,
    });
    return toPostProfile(refreshed);
  });
}

export async function softDeletePostRecord(id: string, actorId: string) {
  await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: actorId },
  });
}
