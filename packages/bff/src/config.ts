export type BffAppKind = "admin" | "therapist" | "website" | "client";

export function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:4000";
  return base.replace(/\/$/, "");
}

export function getAuthLoginPath(app: BffAppKind): string {
  switch (app) {
    case "admin":
    case "website":
      return "/api/v1/auth/admin/login";
    case "therapist":
      return "/api/v1/auth/therapist/login";
    case "client":
      return "/api/v1/auth/client/login";
  }
}
