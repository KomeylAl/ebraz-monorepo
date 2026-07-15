import {
  createTherapistSchema,
  listTherapistsQuerySchema,
  setTherapistPasswordSchema,
  updateTherapistSchema,
  type CreateTherapistInput,
  type SetTherapistPasswordInput,
  type UpdateTherapistInput,
} from "@ebraz/validation/therapists";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  createTherapist,
  deleteTherapist,
  getPublicTherapists,
  getPublicTherapist,
  getTherapist,
  getTherapists,
  setTherapistPassword,
  updateTherapist,
} from "../application/therapists.service";
import { handleTherapistError } from "../domain/therapist-error.handler";

async function getRouteId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) {
    return error("VALIDATION_ERROR", "Therapist id is required", 400);
  }
  return id;
}

export const listTherapistsHandler = withPermission(
  "therapists.read",
  async (request) => {
    const query = parseQuery(request.nextUrl, listTherapistsQuerySchema);
    if (isErrorResponse(query)) return query;

    try {
      const result = await getTherapists(query);
      return success(result);
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);

export const listPublicTherapistsHandler = withPublic(async (request) => {
  const query = parseQuery(request.nextUrl, listTherapistsQuerySchema);
  if (isErrorResponse(query)) return query;

  try {
    const result = await getPublicTherapists(query);
    return success(result);
  } catch (err) {
    return handleTherapistError(err);
  }
});

export const getPublicTherapistHandler = withPublic(
  async (_request, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      return success(await getPublicTherapist(id));
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);

export const createTherapistHandler = withPermission(
  "therapists.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateTherapistInput>(request, createTherapistSchema);
    if (isErrorResponse(input)) return input;

    try {
      const therapist = await createTherapist(input, request.auth.sub);
      return success(therapist, 201);
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);

export const getTherapistHandler = withPermission(
  "therapists.read",
  async (_request, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      const therapist = await getTherapist(id);
      return success(therapist);
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);

export const updateTherapistHandler = withPermission(
  "therapists.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    const input = await parseBody<UpdateTherapistInput>(request, updateTherapistSchema);
    if (isErrorResponse(input)) return input;

    try {
      const therapist = await updateTherapist(id, input, request.auth.sub);
      return success(therapist);
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);

export const setTherapistPasswordHandler = withPermission(
  "therapists.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    const input = await parseBody<SetTherapistPasswordInput>(
      request,
      setTherapistPasswordSchema,
    );
    if (isErrorResponse(input)) return input;

    try {
      const therapist = await setTherapistPassword(id, input, request.auth.sub);
      return success(therapist);
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);

export const deleteTherapistHandler = withPermission(
  "therapists.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      await deleteTherapist(id, request.auth.sub);
      return success({ message: "Therapist deleted" });
    } catch (err) {
      return handleTherapistError(err);
    }
  },
);
