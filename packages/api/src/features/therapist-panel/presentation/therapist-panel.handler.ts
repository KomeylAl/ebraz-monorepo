import {
  changeTherapistPasswordSchema,
  createTherapistResourceSchema,
  listTherapistPanelQuerySchema,
  updateTherapistMeSchema,
  updateTherapistResourceSchema,
  upsertTherapistResumeSchema,
  type ChangeTherapistPasswordInput,
  type CreateTherapistResourceInput,
  type UpdateTherapistMeInput,
  type UpdateTherapistResourceInput,
  type UpsertTherapistResumeInput,
} from "@ebraz/validation/therapist-panel";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withTherapist } from "@/lib/http/with-auth";
import {
  changePasswordWithOtp,
  createResource,
  deleteResource,
  getAdminTherapistSevenDays,
  getAdminTherapistThirtyDays,
  getAdminTherapistResume,
  saveAdminTherapistResume,
  getDashboard,
  getMyProfile,
  getResources,
  getResume,
  getTherapistAppointments,
  getTherapistAssessments,
  getTherapistClient,
  getTherapistClientRecord,
  getTherapistClients,
  getTherapistNotifications,
  saveResume,
  sendPasswordOtp,
  updateMyProfile,
  updateResource,
} from "../application/therapist-panel.service";
import { handleTherapistPanelError } from "../domain/therapist-panel-error.handler";

async function getResourceId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Resource id is required", 400);
  return id;
}

async function getTherapistId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Therapist id is required", 400);
  return id;
}

async function getClientId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Client id is required", 400);
  return id;
}

export const getDashboardHandler = withTherapist(async (request) => {
  try {
    return success(await getDashboard(request.auth));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const listTherapistAppointmentsHandler = withTherapist(async (request) => {
  const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getTherapistAppointments(request.auth, query));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const listTherapistAssessmentsHandler = withTherapist(async (request) => {
  const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getTherapistAssessments(request.auth, query));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const listTherapistNotificationsHandler = withTherapist(async (request) => {
  const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getTherapistNotifications(request.auth, query));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const getResumeHandler = withTherapist(async (request) => {
  try {
    return success(await getResume(request.auth));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const saveResumeHandler = withTherapist(async (request) => {
  const input = await parseBody<UpsertTherapistResumeInput>(request, upsertTherapistResumeSchema);
  if (isErrorResponse(input)) return input;
  try {
    return success(await saveResume(request.auth, input));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const listResourcesHandler = withTherapist(async (request) => {
  const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getResources(request.auth, query));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const createResourceHandler = withTherapist(async (request) => {
  const input = await parseBody<CreateTherapistResourceInput>(
    request,
    createTherapistResourceSchema,
  );
  if (isErrorResponse(input)) return input;
  try {
    return success(await createResource(request.auth, input), 201);
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const updateResourceHandler = withTherapist(
  async (request: AuthenticatedRequest, context) => {
    const id = await getResourceId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<UpdateTherapistResourceInput>(
      request,
      updateTherapistResourceSchema,
    );
    if (isErrorResponse(input)) return input;
    try {
      return success(await updateResource(request.auth, id, input));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const deleteResourceHandler = withTherapist(
  async (request: AuthenticatedRequest, context) => {
    const id = await getResourceId(context);
    if (id instanceof Response) return id;
    try {
      await deleteResource(request.auth, id);
      return success({ message: "Resource deleted" });
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const adminTherapistSevenDaysHandler = withPermission(
  "appointments.read",
  async (request, context) => {
    const therapistId = await getTherapistId(context);
    if (therapistId instanceof Response) return therapistId;
    const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
    if (isErrorResponse(query)) return query;
    try {
      return success(await getAdminTherapistSevenDays(therapistId, query));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const adminTherapistThirtyDaysHandler = withPermission(
  "appointments.read",
  async (request, context) => {
    const therapistId = await getTherapistId(context);
    if (therapistId instanceof Response) return therapistId;
    const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
    if (isErrorResponse(query)) return query;
    try {
      return success(await getAdminTherapistThirtyDays(therapistId, query));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const adminTherapistResumeGetHandler = withPermission(
  "therapists.read",
  async (_request, context) => {
    const therapistId = await getTherapistId(context);
    if (therapistId instanceof Response) return therapistId;
    try {
      return success(await getAdminTherapistResume(therapistId));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const adminTherapistResumeSaveHandler = withPermission(
  "therapists.write",
  async (request: AuthenticatedRequest, context) => {
    const therapistId = await getTherapistId(context);
    if (therapistId instanceof Response) return therapistId;
    const input = await parseBody<UpsertTherapistResumeInput>(request, upsertTherapistResumeSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await saveAdminTherapistResume(therapistId, input));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const listTherapistClientsHandler = withTherapist(async (request) => {
  const query = parseQuery(request.nextUrl, listTherapistPanelQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getTherapistClients(request.auth, query));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const getTherapistClientHandler = withTherapist(
  async (request: AuthenticatedRequest, context) => {
    const clientId = await getClientId(context);
    if (clientId instanceof Response) return clientId;
    try {
      return success(await getTherapistClient(request.auth, clientId));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const getTherapistClientRecordHandler = withTherapist(
  async (request: AuthenticatedRequest, context) => {
    const clientId = await getClientId(context);
    if (clientId instanceof Response) return clientId;
    try {
      return success(await getTherapistClientRecord(request.auth, clientId));
    } catch (err) {
      return handleTherapistPanelError(err);
    }
  },
);

export const getMyProfileHandler = withTherapist(async (request) => {
  try {
    return success(await getMyProfile(request.auth));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const updateMyProfileHandler = withTherapist(async (request) => {
  const input = await parseBody<UpdateTherapistMeInput>(request, updateTherapistMeSchema);
  if (isErrorResponse(input)) return input;
  try {
    return success(await updateMyProfile(request.auth, input));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const sendPasswordOtpHandler = withTherapist(async (request) => {
  try {
    return success(await sendPasswordOtp(request.auth));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});

export const changePasswordHandler = withTherapist(async (request) => {
  const input = await parseBody<ChangeTherapistPasswordInput>(
    request,
    changeTherapistPasswordSchema,
  );
  if (isErrorResponse(input)) return input;
  try {
    return success(await changePasswordWithOtp(request.auth, input));
  } catch (err) {
    return handleTherapistPanelError(err);
  }
});
