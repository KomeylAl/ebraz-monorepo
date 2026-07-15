import {
  createAdminSchema,
  listAdminsQuerySchema,
  updateAdminSchema,
  type CreateAdminInput,
  type UpdateAdminInput,
} from "@ebraz/validation/admins";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import {
  createAdmin,
  deleteAdmin,
  getAdmin,
  getAdmins,
  getReceptionAdmins,
  updateAdmin,
} from "../application/admins.service";
import { handleAdminError } from "../domain/admin-error.handler";

async function getRouteId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) {
    return error("VALIDATION_ERROR", "Admin id is required", 400);
  }
  return id;
}

export const listAdminsHandler = withPermission("admins.read", async (request) => {
  const query = parseQuery(request.nextUrl, listAdminsQuerySchema);
  if (isErrorResponse(query)) return query;

  try {
    const result = await getAdmins(query);
    return success(result);
  } catch (err) {
    return handleAdminError(err);
  }
});

export const listReceptionAdminsHandler = withPermission(
  "admins.read",
  async () => {
    try {
      const result = await getReceptionAdmins();
      return success(result);
    } catch (err) {
      return handleAdminError(err);
    }
  },
);

export const createAdminHandler = withPermission(
  "admins.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateAdminInput>(request, createAdminSchema);
    if (isErrorResponse(input)) return input;

    try {
      const admin = await createAdmin(input, request.auth.sub);
      return success(admin, 201);
    } catch (err) {
      return handleAdminError(err);
    }
  },
);

export const getAdminHandler = withPermission(
  "admins.read",
  async (_request, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      const admin = await getAdmin(id);
      return success(admin);
    } catch (err) {
      return handleAdminError(err);
    }
  },
);

export const updateAdminHandler = withPermission(
  "admins.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    const input = await parseBody<UpdateAdminInput>(request, updateAdminSchema);
    if (isErrorResponse(input)) return input;

    try {
      const admin = await updateAdmin(id, input, request.auth.sub);
      return success(admin);
    } catch (err) {
      return handleAdminError(err);
    }
  },
);

export const deleteAdminHandler = withPermission(
  "admins.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      await deleteAdmin(id, request.auth.sub);
      return success({ message: "Admin deleted" });
    } catch (err) {
      return handleAdminError(err);
    }
  },
);
