import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@ebraz/validation/cms/categories";
import { handleCmsError } from "@/features/cms/domain/cms-error.handler";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryBySlug,
  getPublicCategories,
  updateCategory,
} from "../application/categories.service";

async function getSlug(context: { params: Promise<Record<string, string>> }) {
  const { slug } = await context.params;
  if (!slug) return error("VALIDATION_ERROR", "Slug is required", 400);
  return slug;
}

export const listCategoriesHandler = withPermission("cms.read", async (request) => {
  const query = parseQuery(request.nextUrl, listCategoriesQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getCategories(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const listPublicCategoriesHandler = withPublic(async (request) => {
  const query = parseQuery(request.nextUrl, listCategoriesQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPublicCategories(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const createCategoryHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateCategoryInput>(request, createCategorySchema);
    if (isErrorResponse(input)) return input;
    try {
      const category = await createCategory(input, request.auth.sub);
      return success(category, 201);
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const getCategoryHandler = withPermission("cms.read", async (_request, context) => {
  const slug = await getSlug(context);
  if (slug instanceof Response) return slug;
  try {
    return success(await getCategoryBySlug(slug));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const getPublicCategoryHandler = withPublic(async (_request, context) => {
  const slug = await getSlug(context);
  if (slug instanceof Response) return slug;
  try {
    return success(await getCategoryBySlug(slug));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const updateCategoryHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getSlug(context);
    if (slug instanceof Response) return slug;
    const input = await parseBody<UpdateCategoryInput>(request, updateCategorySchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateCategory(slug, input, request.auth.sub));
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const deleteCategoryHandler = withPermission(
  "cms.delete",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getSlug(context);
    if (slug instanceof Response) return slug;
    try {
      await deleteCategory(slug, request.auth.sub);
      return success({ message: "Category deleted" });
    } catch (err) {
      return handleCmsError(err);
    }
  },
);
