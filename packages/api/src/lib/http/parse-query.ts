import { ZodError, type ZodSchema, type z } from "zod";
import { error } from "./response";

export function parseQuery<TSchema extends ZodSchema>(
  url: URL,
  schema: TSchema,
): z.output<TSchema> | Response {
  try {
    const params = Object.fromEntries(url.searchParams.entries());
    return schema.parse(params);
  } catch (err) {
    if (err instanceof ZodError) {
      const details = Object.fromEntries(
        Object.entries(err.flatten().fieldErrors).filter(
          (entry): entry is [string, string[]] => Array.isArray(entry[1]),
        ),
      );
      return error("VALIDATION_ERROR", "Invalid query parameters", 400, details);
    }
    return error("VALIDATION_ERROR", "Invalid query parameters", 400);
  }
}
