import type {
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from "@ebraz/validation/cms/posts";
import { CmsError } from "@/features/cms/domain/cms.errors";
import { toPostProfile, toPostPublicProfile } from "../domain/post.mapper";
import {
  createPostRecord,
  findCategoryById,
  findPostBySlug,
  findPostBySlugExcluding,
  findTagsByIds,
  listPosts,
  softDeletePostRecord,
  updatePostRecord,
} from "../infrastructure/posts.repository";

async function assertCategory(categoryId: string | null | undefined) {
  if (!categoryId) return;
  const category = await findCategoryById(categoryId);
  if (!category) throw new CmsError("Category not found", "NOT_FOUND");
}

async function assertTags(tagIds: string[] | undefined) {
  if (!tagIds?.length) return;
  const tags = await findTagsByIds(tagIds);
  if (tags.length !== tagIds.length) {
    throw new CmsError("One or more tags not found", "NOT_FOUND");
  }
}

export async function getPosts(query: ListPostsQuery) {
  return listPosts(query);
}

export async function getPublicPosts(query: ListPostsQuery) {
  return listPosts(query, true);
}

export async function getPostBySlug(slug: string) {
  const post = await findPostBySlug(slug);
  if (!post) throw new CmsError("Post not found", "NOT_FOUND");
  return toPostProfile(post);
}

export async function getPublicPostBySlug(slug: string) {
  const post = await findPostBySlug(slug, true);
  if (!post) throw new CmsError("Post not found", "NOT_FOUND");
  return toPostPublicProfile(post);
}

export async function createPost(
  input: CreatePostInput,
  actorId: string,
  adminId: string,
) {
  const duplicate = await findPostBySlug(input.slug.trim());
  if (duplicate) throw new CmsError("Post slug already exists", "SLUG_EXISTS");
  await assertCategory(input.categoryId);
  await assertTags(input.tagIds);
  return createPostRecord(input, actorId, adminId);
}

export async function updatePost(
  slug: string,
  input: UpdatePostInput,
  actorId: string,
) {
  const existing = await findPostBySlug(slug);
  if (!existing) throw new CmsError("Post not found", "NOT_FOUND");
  if (input.slug) {
    const duplicate = await findPostBySlugExcluding(input.slug.trim(), existing.id);
    if (duplicate) throw new CmsError("Post slug already exists", "SLUG_EXISTS");
  }
  if (input.categoryId) await assertCategory(input.categoryId);
  await assertTags(input.tagIds);
  return updatePostRecord(existing.id, input, actorId);
}

export async function deletePost(slug: string, actorId: string) {
  const existing = await findPostBySlug(slug);
  if (!existing) throw new CmsError("Post not found", "NOT_FOUND");
  await softDeletePostRecord(existing.id, actorId);
}
