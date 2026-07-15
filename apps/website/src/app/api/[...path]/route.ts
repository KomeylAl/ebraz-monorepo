import { createBffRouteHandlers } from "@ebraz/bff/routes";

const handlers = createBffRouteHandlers("website");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
