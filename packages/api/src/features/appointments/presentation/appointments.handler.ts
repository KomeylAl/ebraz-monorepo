import {
  createAppointmentSchema,
  listAppointmentsQuerySchema,
  updateAppointmentSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from "@ebraz/validation/appointments";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  getAppointmentsByDate,
  updateAppointment,
} from "../application/appointments.service";
import { handleAppointmentError } from "../domain/appointment-error.handler";

async function getRouteId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) {
    return error("VALIDATION_ERROR", "Appointment id is required", 400);
  }
  return id;
}

export const listAppointmentsHandler = withPermission(
  "appointments.read",
  async (request) => {
    const query = parseQuery(request.nextUrl, listAppointmentsQuerySchema);
    if (isErrorResponse(query)) return query;

    try {
      const result = await getAppointments(query);
      return success(result);
    } catch (err) {
      return handleAppointmentError(err);
    }
  },
);

export const listAppointmentsByDateHandler = withPermission(
  "appointments.read",
  async (request, context) => {
    const { date } = await context.params;
    if (!date) {
      return error("VALIDATION_ERROR", "Date is required", 400);
    }

    const query = parseQuery(request.nextUrl, listAppointmentsQuerySchema);
    if (isErrorResponse(query)) return query;

    try {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return error("VALIDATION_ERROR", "Invalid date", 400);
      }

      const result = await getAppointmentsByDate(parsedDate, query);
      return success(result);
    } catch (err) {
      return handleAppointmentError(err);
    }
  },
);

export const createAppointmentHandler = withPermission(
  "appointments.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateAppointmentInput>(request, createAppointmentSchema);
    if (isErrorResponse(input)) return input;

    try {
      const appointment = await createAppointment(input, request.auth.sub);
      return success(appointment, 201);
    } catch (err) {
      return handleAppointmentError(err);
    }
  },
);

export const getAppointmentHandler = withPermission(
  "appointments.read",
  async (_request, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      const appointment = await getAppointment(id);
      return success(appointment);
    } catch (err) {
      return handleAppointmentError(err);
    }
  },
);

export const updateAppointmentHandler = withPermission(
  "appointments.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    const input = await parseBody<UpdateAppointmentInput>(request, updateAppointmentSchema);
    if (isErrorResponse(input)) return input;

    try {
      const appointment = await updateAppointment(id, input, request.auth.sub);
      return success(appointment);
    } catch (err) {
      return handleAppointmentError(err);
    }
  },
);

export const deleteAppointmentHandler = withPermission(
  "appointments.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      await deleteAppointment(id, request.auth.sub);
      return success({ message: "Appointment deleted" });
    } catch (err) {
      return handleAppointmentError(err);
    }
  },
);
