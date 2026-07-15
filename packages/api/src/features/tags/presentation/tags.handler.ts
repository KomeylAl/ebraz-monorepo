import {
  createTagSchema,
  listTagsQuerySchema,
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from "@ebraz/validation/cms/tags";
import { handleCmsError } from "@/features/cms/domain/cms-error.handler";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  createTag,
  deleteTag,
  getPublicTags,
  getTagById,
  getTags,
  updateTag,
} from "../application/tags.service";

async function getId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Tag id is required", 400);
  return id;
}

export const listTagsHandler = withPermission("cms.read", async (request) => {
  const query = parseQuery(request.nextUrl, listTagsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getTags(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const listPublicTagsHandler = withPublic(async (request) => {
  const query = parseQuery(request.nextUrl, listTagsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPublicTags(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const createTagHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateTagInput>(request, createTagSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await createTag(input, request.auth.sub), 201);
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const getTagHandler = withPermission("cms.read", async (_request, context) => {
  const id = await getId(context);
  if (id instanceof Response) return id;
  try {
    return success(await getTagById(id));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const getPublicTagHandler = withPublic(async (_request, context) => {
  const id = await getId(context);
  if (id instanceof Response) return id;
  try {
    return success(await getTagById(id));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const updateTagHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<UpdateTagInput>(request, updateTagSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateTag(id, input, request.auth.sub));
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const deleteTagHandler = withPermission(
  "cms.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getId(context);
    if (id instanceof Response) return id;
    try {
      await deleteTag(id, request.auth.sub);
      return success({ message: "Tag deleted" });
    } catch (err) {
      return handleCmsError(err);
    }
  },
);
