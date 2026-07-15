import {
  createClientSchema,
  listClientsQuerySchema,
  setClientPasswordSchema,
  updateClientSchema,
  type CreateClientInput,
  type SetClientPasswordInput,
  type UpdateClientInput,
} from "@ebraz/validation/clients";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  setClientPassword,
  updateClient,
} from "../application/clients.service";
import { handleClientError } from "../domain/client-error.handler";

async function getRouteId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) {
    return error("VALIDATION_ERROR", "Client id is required", 400);
  }
  return id;
}

export const listClientsHandler = withPermission("clients.read", async (request) => {
  const query = parseQuery(request.nextUrl, listClientsQuerySchema);
  if (isErrorResponse(query)) return query;

  try {
    const result = await getClients(query);
    return success(result);
  } catch (err) {
    return handleClientError(err);
  }
});

export const createClientHandler = withPermission(
  "clients.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateClientInput>(request, createClientSchema);
    if (isErrorResponse(input)) return input;

    try {
      const client = await createClient(input, request.auth.sub);
      return success(client, 201);
    } catch (err) {
      return handleClientError(err);
    }
  },
);

export const getClientHandler = withPermission(
  "clients.read",
  async (_request, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      const client = await getClient(id);
      return success(client);
    } catch (err) {
      return handleClientError(err);
    }
  },
);

export const updateClientHandler = withPermission(
  "clients.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    const input = await parseBody<UpdateClientInput>(request, updateClientSchema);
    if (isErrorResponse(input)) return input;

    try {
      const client = await updateClient(id, input, request.auth.sub);
      return success(client);
    } catch (err) {
      return handleClientError(err);
    }
  },
);

export const setClientPasswordHandler = withPermission(
  "clients.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    const input = await parseBody<SetClientPasswordInput>(request, setClientPasswordSchema);
    if (isErrorResponse(input)) return input;

    try {
      const client = await setClientPassword(id, input, request.auth.sub);
      return success(client);
    } catch (err) {
      return handleClientError(err);
    }
  },
);

export const deleteClientHandler = withPermission(
  "clients.delete",
  async (request: AuthenticatedRequest, context) => {
    const id = await getRouteId(context);
    if (id instanceof Response) return id;

    try {
      await deleteClient(id, request.auth.sub);
      return success({ message: "Client deleted" });
    } catch (err) {
      return handleClientError(err);
    }
  },
);
