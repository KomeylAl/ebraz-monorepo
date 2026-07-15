import { ACCESS_TOKEN_TTL_SECONDS } from "@ebraz/config";
import { prisma } from "@ebraz/database";
import type {
  AccessTokenPayload,
  AdminSubRole,
  AuthTokens,
  AuthUser,
  AuthUserProfile,
  DbUserRole,
} from "@ebraz/types";
import { hashToken } from "@ebraz/utils/crypto";
import { normalizePhone } from "@ebraz/utils/phone";
import type { LoginInput, RegisterInput } from "@ebraz/validation";
import { resolvePermissionsFromDb } from "./permission.service";
import { signAccessToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password";
import { createRefreshToken, revokeRefreshToken, rotateRefreshToken } from "./refresh-token";
import {
  findUserById,
  findUserByPhone,
  mapToSafeUser,
  type SafeUserRecord,
} from "./user.repository";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function buildAuthUser(
  user: { id: string },
  role: DbUserRole,
  subRole?: AdminSubRole,
): Promise<AuthUser> {
  const permissions = await resolvePermissionsFromDb(role, subRole);
  return {
    id: user.id,
    role,
    subRole,
    permissions,
  };
}

function assertHasPassword(
  user: SafeUserRecord | null,
): asserts user is SafeUserRecord & { password: string } {
  if (!user?.password) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }
}

export async function login(
  input: LoginInput,
  role: DbUserRole,
): Promise<{ user: AuthUserProfile; tokens: AuthTokens }> {
  const user = await findUserByPhone(input.phone, role);
  assertHasPassword(user);

  const isValid = await verifyPassword(input.password, user.password);
  if (!isValid) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  const subRole = role === "ADMIN" && "subRole" in user ? user.subRole : undefined;
  const authUser = await buildAuthUser(user, role, subRole);
  const accessToken = await signAccessToken({
    userId: user.id,
    role,
    subRole,
    permissions: authUser.permissions,
  });
  const refresh = await createRefreshToken({ userId: user.id, userRole: role });

  return {
    user: mapToSafeUser(user, role, authUser.permissions),
    tokens: {
      accessToken,
      refreshToken: refresh.refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    },
  };
}

export async function registerClient(
  input: RegisterInput,
): Promise<{ user: AuthUserProfile; tokens: AuthTokens }> {
  const normalizedPhone = normalizePhone(input.phone);
  const existing = await findUserByPhone(normalizedPhone, "CLIENT");

  if (existing) {
    throw new AuthError("Phone already registered", "PHONE_EXISTS");
  }

  const hashedPassword = await hashPassword(input.password);
  const user = await prisma.client.create({
    data: {
      name: input.name,
      phone: normalizedPhone,
      password: hashedPassword,
      birthDate: input.birthDate,
    },
  });

  const authUser = await buildAuthUser(user, "CLIENT");
  const accessToken = await signAccessToken({
    userId: user.id,
    role: "CLIENT",
    permissions: authUser.permissions,
  });
  const refresh = await createRefreshToken({ userId: user.id, userRole: "CLIENT" });

  return {
    user: mapToSafeUser(user, "CLIENT", authUser.permissions),
    tokens: {
      accessToken,
      refreshToken: refresh.refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    },
  };
}

export async function refresh(
  refreshToken: string,
): Promise<AuthTokens & { user: AuthUserProfile }> {
  const rotated = await rotateRefreshToken(refreshToken);

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rotated.refreshToken) },
  });

  if (!record) {
    throw new AuthError("Invalid refresh token", "INVALID_REFRESH_TOKEN");
  }

  const dbUser = await findUserById(record.userId, record.userRole);
  if (!dbUser) {
    throw new AuthError("User not found", "USER_NOT_FOUND");
  }

  const subRole =
    record.userRole === "ADMIN" && "subRole" in dbUser ? dbUser.subRole : undefined;
  const authUser = await buildAuthUser({ id: record.userId }, record.userRole, subRole);
  const accessToken = await signAccessToken({
    userId: record.userId,
    role: record.userRole,
    subRole,
    permissions: authUser.permissions,
  });

  return {
    user: mapToSafeUser(dbUser, record.userRole, authUser.permissions),
    accessToken,
    refreshToken: rotated.refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await revokeRefreshToken(refreshToken);
}

export async function getMe(payload: AccessTokenPayload): Promise<AuthUserProfile> {
  const role = payload.role;
  if (role === "PUBLIC") {
    throw new AuthError("Unauthorized", "UNAUTHORIZED");
  }

  const user = await findUserById(payload.sub, role);
  if (!user) {
    throw new AuthError("User not found", "USER_NOT_FOUND");
  }

  const subRole = role === "ADMIN" && "subRole" in user ? user.subRole : payload.subRole;
  const permissions = await resolvePermissionsFromDb(role, subRole);

  return mapToSafeUser(user, role, permissions);
}
