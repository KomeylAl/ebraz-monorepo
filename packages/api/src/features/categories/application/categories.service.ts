import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "@ebraz/validation/cms/categories";
import { CmsError } from "@/features/cms/domain/cms.errors";
import { toCategoryProfile } from "../domain/category.mapper";
import {
  createCategoryRecord,
  findCategoryBySlug,
  findCategoryBySlugExcluding,
  listCategories,
  softDeleteCategoryRecord,
  updateCategoryRecord,
} from "../infrastructure/categories.repository";

export async function getCategories(query: ListCategoriesQuery) {
  return listCategories(query);
}

export async function getPublicCategories(query: ListCategoriesQuery) {
  return listCategories(query);
}

export async function getCategoryBySlug(slug: string) {
  const category = await findCategoryBySlug(slug);
  if (!category) {
    throw new CmsError("Category not found", "NOT_FOUND");
  }
  return toCategoryProfile(category);
}

export async function createCategory(input: CreateCategoryInput, actorId: string) {
  const duplicate = await findCategoryBySlug(input.slug.trim());
  if (duplicate) {
    throw new CmsError("Category slug already exists", "SLUG_EXISTS");
  }
  return createCategoryRecord(input, actorId);
}

export async function updateCategory(
  slug: string,
  input: UpdateCategoryInput,
  actorId: string,
) {
  const existing = await findCategoryBySlug(slug);
  if (!existing) {
    throw new CmsError("Category not found", "NOT_FOUND");
  }
  if (input.slug) {
    const duplicate = await findCategoryBySlugExcluding(input.slug.trim(), existing.id);
    if (duplicate) {
      throw new CmsError("Category slug already exists", "SLUG_EXISTS");
    }
  }
  return updateCategoryRecord(existing.id, input, actorId);
}

export async function deleteCategory(slug: string, actorId: string) {
  const existing = await findCategoryBySlug(slug);
  if (!existing) {
    throw new CmsError("Category not found", "NOT_FOUND");
  }
  await softDeleteCategoryRecord(existing.id, actorId);
}
