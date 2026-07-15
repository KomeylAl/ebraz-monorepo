import { ZodError, type ZodSchema } from "zod";
import { error } from "./response";

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T | Response> {
  try {
    const body: unknown = await request.json();
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const details = Object.fromEntries(
        Object.entries(err.flatten().fieldErrors).filter(
          (entry): entry is [string, string[]] => Array.isArray(entry[1]),
        ),
      );
      return error("VALIDATION_ERROR", "Invalid request body", 400, details);
    }
    return error("VALIDATION_ERROR", "Invalid request body", 400);
  }
}

export function isErrorResponse<T>(result: T | Response): result is Response {
  return result instanceof Response;
}
