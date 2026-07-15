import {
  createWorkshopSchema,
  createWorkshopSessionSchema,
  listWorkshopsQuerySchema,
  participantInputSchema,
  registerWorkshopSchema,
  updateParticipantSchema,
  updateWorkshopSchema,
  updateWorkshopSessionSchema,
  type CreateWorkshopInput,
  type CreateWorkshopSessionInput,
  type ParticipantInput,
  type RegisterWorkshopInput,
  type UpdateParticipantInput,
  type UpdateWorkshopInput,
  type UpdateWorkshopSessionInput,
} from "@ebraz/validation/workshops";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  addWorkshopParticipant,
  approveWorkshopParticipant,
  createWorkshop,
  createWorkshopSession,
  deleteWorkshop,
  deleteWorkshopSession,
  getPublicWorkshopById,
  getPublicWorkshops,
  getWorkshopById,
  getWorkshops,
  registerForWorkshop,
  removeWorkshopParticipant,
  unapproveWorkshopParticipant,
  updateWorkshop,
  updateWorkshopParticipant,
  updateWorkshopSession,
} from "../application/workshops.service";
import { handleWorkshopError } from "../domain/workshop-error.handler";

async function getWorkshopId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Workshop id is required", 400);
  return id;
}

async function getSessionId(context: { params: Promise<Record<string, string>> }) {
  const { sessionId } = await context.params;
  if (!sessionId) return error("VALIDATION_ERROR", "Session id is required", 400);
  return sessionId;
}

async function getParticipantId(context: { params: Promise<Record<string, string>> }) {
  const { participantId } = await context.params;
  if (!participantId) return error("VALIDATION_ERROR", "Participant id is required", 400);
  return participantId;
}

export const listWorkshopsHandler = withPermission("workshops.read", async (request) => {
  const query = parseQuery(request.nextUrl, listWorkshopsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getWorkshops(query));
  } catch (err) {
    return handleWorkshopError(err);
  }
});

export const listPublicWorkshopsHandler = withPublic(async (request) => {
  const query = parseQuery(request.nextUrl, listWorkshopsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPublicWorkshops(query));
  } catch (err) {
    return handleWorkshopError(err);
  }
});

export const createWorkshopHandler = withPermission(
  "workshops.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateWorkshopInput>(request, createWorkshopSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await createWorkshop(input, request.auth.sub), 201);
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const getWorkshopHandler = withPermission(
  "workshops.read",
  async (_request, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    try {
      return success(await getWorkshopById(id));
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const getPublicWorkshopHandler = withPublic(async (_request, context) => {
  const id = await getWorkshopId(context);
  if (id instanceof Response) return id;
  try {
    return success(await getPublicWorkshopById(id));
  } catch (err) {
    return handleWorkshopError(err);
  }
});

export const updateWorkshopHandler = withPermission(
  "workshops.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<UpdateWorkshopInput>(request, updateWorkshopSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateWorkshop(id, input, request.auth.sub));
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const deleteWorkshopHandler = withPermission(
  "workshops.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    try {
      await deleteWorkshop(id, request.auth.sub);
      return success({ message: "Workshop deleted" });
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const registerWorkshopHandler = withPublic(async (request, context) => {
  const id = await getWorkshopId(context);
  if (id instanceof Response) return id;
  const input = await parseBody<RegisterWorkshopInput>(request, registerWorkshopSchema);
  if (isErrorResponse(input)) return input;
  try {
    return success(await registerForWorkshop(id, input), 201);
  } catch (err) {
    return handleWorkshopError(err);
  }
});

export const createWorkshopSessionHandler = withPermission(
  "workshops.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<CreateWorkshopSessionInput>(
      request,
      createWorkshopSessionSchema,
    );
    if (isErrorResponse(input)) return input;
    try {
      return success(await createWorkshopSession(id, input, request.auth.sub), 201);
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const updateWorkshopSessionHandler = withPermission(
  "workshops.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const sessionId = await getSessionId(context);
    if (sessionId instanceof Response) return sessionId;
    const input = await parseBody<UpdateWorkshopSessionInput>(
      request,
      updateWorkshopSessionSchema,
    );
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateWorkshopSession(id, sessionId, input, request.auth.sub));
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const deleteWorkshopSessionHandler = withPermission(
  "workshops.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const sessionId = await getSessionId(context);
    if (sessionId instanceof Response) return sessionId;
    try {
      await deleteWorkshopSession(id, sessionId, request.auth.sub);
      return success({ message: "Session deleted" });
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const addWorkshopParticipantHandler = withPermission(
  "workshops.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<ParticipantInput>(request, participantInputSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await addWorkshopParticipant(id, input, request.auth.sub), 201);
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const updateWorkshopParticipantHandler = withPermission(
  "workshops.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const participantId = await getParticipantId(context);
    if (participantId instanceof Response) return participantId;
    const input = await parseBody<UpdateParticipantInput>(request, updateParticipantSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(
        await updateWorkshopParticipant(id, participantId, input, request.auth.sub),
      );
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const deleteWorkshopParticipantHandler = withPermission(
  "workshops.delete",
  async (_request: AuthenticatedRequest, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const participantId = await getParticipantId(context);
    if (participantId instanceof Response) return participantId;
    try {
      await removeWorkshopParticipant(id, participantId);
      return success({ message: "Participant removed" });
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const approveWorkshopParticipantHandler = withPermission(
  "workshops.write",
  async (_request, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const participantId = await getParticipantId(context);
    if (participantId instanceof Response) return participantId;
    try {
      return success(await approveWorkshopParticipant(id, participantId));
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);

export const unapproveWorkshopParticipantHandler = withPermission(
  "workshops.write",
  async (_request, context) => {
    const id = await getWorkshopId(context);
    if (id instanceof Response) return id;
    const participantId = await getParticipantId(context);
    if (participantId instanceof Response) return participantId;
    try {
      return success(await unapproveWorkshopParticipant(id, participantId));
    } catch (err) {
      return handleWorkshopError(err);
    }
  },
);
