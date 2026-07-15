import {
  createPublicAssessmentSchema,
  listAssessmentsQuerySchema,
  updateAssessmentSchema,
  type CreatePublicAssessmentInput,
  type UpdateAssessmentInput,
} from "@ebraz/validation/assessments";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  deleteAssessment,
  getAssessmentById,
  getAssessments,
  registerPublicAssessment,
  updateAssessment,
} from "../application/assessments.service";
import { handleAssessmentError } from "../domain/assessment-error.handler";

async function getAssessmentId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Assessment id is required", 400);
  return id;
}

export const listAssessmentsHandler = withPermission("appointments.read", async (request) => {
  const query = parseQuery(request.nextUrl, listAssessmentsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getAssessments(query));
  } catch (err) {
    return handleAssessmentError(err);
  }
});

export const registerPublicAssessmentHandler = withPublic(async (request) => {
  const input = await parseBody<CreatePublicAssessmentInput>(
    request,
    createPublicAssessmentSchema,
  );
  if (isErrorResponse(input)) return input;
  try {
    return success(await registerPublicAssessment(input), 201);
  } catch (err) {
    return handleAssessmentError(err);
  }
});

export const getAssessmentHandler = withPermission(
  "appointments.read",
  async (_request, context) => {
    const id = await getAssessmentId(context);
    if (id instanceof Response) return id;
    try {
      return success(await getAssessmentById(id));
    } catch (err) {
      return handleAssessmentError(err);
    }
  },
);

export const updateAssessmentHandler = withPermission(
  "appointments.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getAssessmentId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<UpdateAssessmentInput>(request, updateAssessmentSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateAssessment(id, input, request.auth.sub));
    } catch (err) {
      return handleAssessmentError(err);
    }
  },
);

export const deleteAssessmentHandler = withPermission(
  "appointments.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getAssessmentId(context);
    if (id instanceof Response) return id;
    try {
      await deleteAssessment(id, request.auth.sub);
      return success({ message: "Assessment deleted" });
    } catch (err) {
      return handleAssessmentError(err);
    }
  },
);
