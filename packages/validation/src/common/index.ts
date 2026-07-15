import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(10, "شماره تلفن معتبر نیست")
  .max(15, "شماره تلفن معتبر نیست");

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد");

/** Treat "", null, undefined as missing so optional query params from legacy UIs validate. */
export function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  }, schema);
}

export const optionalDateQuerySchema = emptyToUndefined(
  z.coerce.date({ invalid_type_error: "تاریخ معتبر نیست" }).optional(),
);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: emptyToUndefined(z.string().optional()),
  sortBy: emptyToUndefined(z.string().optional()),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
