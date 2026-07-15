import { authFetch } from "@ebraz/auth/client";
import type { ApiResponse, PaginatedResult } from "@ebraz/types";
import type { AuthUserProfile } from "@ebraz/types";
import type { PostPublicProfile } from "@ebraz/types/cms";
import type { LoginInput } from "@ebraz/validation";
import { ApiError } from "./errors";

export type AuthRole = "admin" | "therapist" | "client";

export interface LoginResponse {
  user: AuthUserProfile;
  accessToken: string;
  expiresIn: number;
}

export interface ApiClient {
  baseUrl: string;
  request<T>(path: string, init?: RequestInit): Promise<T>;
  auth: {
    login(role: AuthRole, input: LoginInput): Promise<LoginResponse>;
    me(): Promise<AuthUserProfile>;
    logout(): Promise<void>;
  };
  posts: {
    listPublic(params?: { page?: number; pageSize?: number }): Promise<PaginatedResult<PostPublicProfile>>;
  };
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createApiClient(baseUrl: string): ApiClient {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await authFetch(path, { ...init, headers }, baseUrl);
    const json = (await response.json()) as ApiResponse<T>;

    if (!json.success) {
      throw new ApiError(json.error.code, json.error.message, response.status, json.error.details);
    }

    return json.data;
  }

  return {
    baseUrl,
    request,
    auth: {
      login: (role, input) =>
        request<LoginResponse>(`/api/v1/auth/${role}/login`, {
          method: "POST",
          body: JSON.stringify(input),
        }),
      me: () => request<AuthUserProfile>("/api/v1/auth/me"),
      logout: () =>
        request<void>("/api/v1/auth/logout", {
          method: "POST",
        }),
    },
    posts: {
      listPublic: (params) =>
        request<PaginatedResult<PostPublicProfile>>(
          `/api/v1/posts/public${buildQuery(params)}`,
        ),
    },
  };
}
