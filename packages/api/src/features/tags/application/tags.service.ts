import type {
  CreateTagInput,
  ListTagsQuery,
  UpdateTagInput,
} from "@ebraz/validation/cms/tags";
import { CmsError } from "@/features/cms/domain/cms.errors";
import { toTagProfile } from "../domain/tag.mapper";
import {
  createTagRecord,
  findTagById,
  findTagBySlug,
  listTags,
  softDeleteTagRecord,
  updateTagRecord,
} from "../infrastructure/tags.repository";

export async function getTags(query: ListTagsQuery) {
  return listTags(query);
}

export async function getPublicTags(query: ListTagsQuery) {
  return listTags(query);
}

export async function getTagById(id: string) {
  const tag = await findTagById(id);
  if (!tag) throw new CmsError("Tag not found", "NOT_FOUND");
  return toTagProfile(tag);
}

export async function createTag(input: CreateTagInput, actorId: string) {
  const duplicate = await findTagBySlug(input.slug.trim());
  if (duplicate) throw new CmsError("Tag slug already exists", "SLUG_EXISTS");
  return createTagRecord(input, actorId);
}

export async function updateTag(id: string, input: UpdateTagInput, actorId: string) {
  const existing = await findTagById(id);
  if (!existing) throw new CmsError("Tag not found", "NOT_FOUND");
  if (input.slug) {
    const duplicate = await findTagBySlug(input.slug.trim(), existing.id);
    if (duplicate) throw new CmsError("Tag slug already exists", "SLUG_EXISTS");
  }
  return updateTagRecord(existing.id, input, actorId);
}

export async function deleteTag(id: string, actorId: string) {
  const existing = await findTagById(id);
  if (!existing) throw new CmsError("Tag not found", "NOT_FOUND");
  await softDeleteTagRecord(existing.id, actorId);
}
