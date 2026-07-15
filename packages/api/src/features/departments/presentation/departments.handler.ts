import {
  createDepartmentSchema,
  listDepartmentsQuerySchema,
  updateDepartmentSchema,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
} from "@ebraz/validation/cms/departments";
import { handleCmsError } from "@/features/cms/domain/cms-error.handler";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentBySlug,
  getDepartments,
  getPublicDepartmentBySlug,
  getPublicDepartments,
  updateDepartment,
} from "../application/departments.service";

async function getSlug(context: { params: Promise<Record<string, string>> }) {
  const { slug } = await context.params;
  if (!slug) return error("VALIDATION_ERROR", "Slug is required", 400);
  return slug;
}

export const listDepartmentsHandler = withPermission("cms.read", async (request) => {
  const query = parseQuery(request.nextUrl, listDepartmentsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getDepartments(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const listPublicDepartmentsHandler = withPublic(async (request) => {
  const query = parseQuery(request.nextUrl, listDepartmentsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPublicDepartments(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const createDepartmentHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateDepartmentInput>(request, createDepartmentSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await createDepartment(input, request.auth.sub), 201);
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const getDepartmentHandler = withPermission("cms.read", async (_request, context) => {
  const slug = await getSlug(context);
  if (slug instanceof Response) return slug;
  try {
    return success(await getDepartmentBySlug(slug));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const getPublicDepartmentHandler = withPublic(async (_request, context) => {
  const slug = await getSlug(context);
  if (slug instanceof Response) return slug;
  try {
    return success(await getPublicDepartmentBySlug(slug));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const updateDepartmentHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getSlug(context);
    if (slug instanceof Response) return slug;
    const input = await parseBody<UpdateDepartmentInput>(request, updateDepartmentSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateDepartment(slug, input, request.auth.sub));
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const deleteDepartmentHandler = withPermission(
  "cms.delete",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getSlug(context);
    if (slug instanceof Response) return slug;
    try {
      await deleteDepartment(slug, request.auth.sub);
      return success({ message: "Department deleted" });
    } catch (err) {
      return handleCmsError(err);
    }
  },
);
