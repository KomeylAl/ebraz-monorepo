import type { AdminSubRole, AuthUserProfile } from "@ebraz/types";
import { normalizeAssetPath } from "./asset-url";

export function mapLegacyRoleCookie(subRole?: AdminSubRole): string {
  if (subRole === "author") return "author";
  if (subRole === "accountant") return "accountant";
  return "admin";
}

export function toLegacyUser(user: AuthUserProfile): Record<string, unknown> {
  if (user.role === "ADMIN" && user.subRole) {
    return { ...user, role: user.subRole };
  }
  if (user.role === "THERAPIST") {
    return { ...user, role: "doctor" };
  }
  if (user.role === "CLIENT") {
    return { ...user, role: "client" };
  }
  return { ...user, role: String(user.role).toLowerCase() };
}

export function transformLoginResponse(data: {
  accessToken: string;
  user: AuthUserProfile;
  expiresIn?: number;
}) {
  const user = toLegacyUser(data.user);
  return {
    access_token: data.accessToken,
    user,
    expires_in: data.expiresIn,
  };
}

function isPaginatedPayload(
  value: unknown,
): value is { data: unknown[]; meta: Record<string, unknown> } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { data?: unknown }).data) &&
    typeof (value as { meta?: unknown }).meta === "object" &&
    (value as { meta?: unknown }).meta !== null
  );
}

export function transformPaginatedMeta(meta: Record<string, unknown>) {
  const page = Number(meta.page ?? meta.current_page ?? 1);
  const pageSize = Number(meta.pageSize ?? meta.per_page ?? 10);
  const total = Number(meta.total ?? 0);
  const totalPages = Number(
    meta.totalPages ?? meta.total_pages ?? (pageSize > 0 ? Math.ceil(total / pageSize) : 1),
  );
  return {
    current_page: page,
    per_page: pageSize,
    total,
    total_pages: totalPages,
    last_page: totalPages,
  };
}

/** Convert API camelCase payloads to legacy snake_case expected by migrated UI. */
export function deepSnakeCase(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepSnakeCase);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      deepSnakeCase(nested),
    ]);
    const result = Object.fromEntries(entries) as Record<string, unknown>;

    // Legacy panels still read `doctor` / `social_links` after the doctor→therapist rename.
    if ("therapist" in result && !("doctor" in result)) {
      result.doctor = result.therapist;
    }

    return result;
  }
  if (typeof value === "string") {
    return normalizeAssetPath(value) ?? value;
  }
  return value;
}

export function transformSuccessData(data: unknown, legacyPath: string): unknown {
  if (isPaginatedPayload(data)) {
    return {
      data: deepSnakeCase(data.data),
      meta: transformPaginatedMeta(data.meta),
    };
  }

  if (legacyPath.includes("/panel/today-sms") || legacyPath.includes("/panel/tomorrow-sms")) {
    return { message: "Sms sent successfuly" };
  }

  if (typeof data === "object" && data !== null && "id" in data && !Array.isArray(data)) {
    return { data: deepSnakeCase(data) };
  }

  return deepSnakeCase(data);
}

export function transformApiJson(
  json: unknown,
  legacyPath: string,
): { ok: true; body: unknown; status: number } | { ok: false; body: unknown; status: number } {
  if (typeof json !== "object" || json === null) {
    return { ok: true, body: json, status: 200 };
  }

  const payload = json as {
    success?: boolean;
    data?: unknown;
    error?: { message?: string; code?: string; details?: unknown };
  };

  if (payload.success === false) {
    return {
      ok: false,
      body: { message: payload.error?.message ?? "Request failed", ...payload.error },
      status: 400,
    };
  }

  if (payload.success === true) {
    return {
      ok: true,
      body: transformSuccessData(payload.data, legacyPath),
      status: 200,
    };
  }

  return { ok: true, body: json, status: 200 };
}

export function transformLegacyCreateMessage(method: string, status: number, legacyPath: string) {
  if (method !== "POST" || status < 200 || status >= 300) return null;
  if (legacyPath.endsWith("/clients") && !legacyPath.includes("/clients/")) {
    return { message: "Admin added successfuly" };
  }
  if (legacyPath.endsWith("/doctors") && !legacyPath.includes("/doctors/")) {
    return { message: "Doctor added successfuly" };
  }
  if (/\/doctors\/[^/]+$/.test(legacyPath) && method === "POST") {
    return { message: "Doctor editted successfuly" };
  }
  if (/\/clients\/[^/]+$/.test(legacyPath) && method === "POST") {
    return { message: "Client updated successfuly" };
  }
  if (legacyPath.includes("/resume") && method === "POST") {
    return { message: "Resume saved successfuly" };
  }
  return null;
}

export type LegacyPaginated<T = unknown> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

const EMPTY_META: LegacyPaginated["meta"] = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 1,
};

/** Normalize any API list payload into a safe `{ data, meta }` shape for legacy UI. */
export function ensurePaginated<T = unknown>(value: unknown): LegacyPaginated<T> {
  if (!value || typeof value !== "object") {
    return { data: [], meta: { ...EMPTY_META } };
  }

  const payload = value as Record<string, unknown>;
  const data = Array.isArray(payload.data) ? (payload.data as T[]) : [];
  const rawMeta =
    payload.meta && typeof payload.meta === "object"
      ? (payload.meta as Record<string, unknown>)
      : {};

  const currentPage = Number(rawMeta.current_page ?? rawMeta.page ?? 1) || 1;
  const perPage = Number(rawMeta.per_page ?? rawMeta.pageSize ?? 10) || 10;
  const total = Number(rawMeta.total ?? 0) || 0;
  const lastPage =
    Number(rawMeta.last_page ?? rawMeta.total_pages ?? rawMeta.totalPages) ||
    (perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1);

  return {
    data,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
      total_pages: lastPage,
    },
  };
}
