export type UserRole = "ADMIN" | "THERAPIST" | "CLIENT" | "PUBLIC";

export type DbUserRole = Exclude<UserRole, "PUBLIC">;

export type AdminSubRole =
  | "boss"
  | "receptionist"
  | "manager"
  | "author"
  | "accountant";

export type Permission =
  | "appointments.read"
  | "appointments.write"
  | "appointments.delete"
  | "clients.read"
  | "clients.write"
  | "clients.delete"
  | "therapists.read"
  | "therapists.write"
  | "therapists.delete"
  | "admins.read"
  | "admins.write"
  | "admins.delete"
  | "cms.read"
  | "cms.write"
  | "cms.delete"
  | "workshops.read"
  | "workshops.write"
  | "workshops.delete"
  | "payments.read"
  | "payments.write"
  | "settings.read"
  | "settings.write";

export interface AuthUser {
  id: string;
  role: UserRole;
  subRole?: AdminSubRole;
  permissions: Permission[];
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  subRole?: AdminSubRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
