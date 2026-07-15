import { ACCESS_TOKEN_TTL_SECONDS } from "@ebraz/config";
import type { AccessTokenPayload, AdminSubRole, Permission, UserRole } from "@ebraz/types";
import { SignJWT, jwtVerify } from "jose";

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(params: {
  userId: string;
  role: UserRole;
  subRole?: AdminSubRole;
  permissions: Permission[];
}): Promise<string> {
  const payload: Omit<AccessTokenPayload, "iat" | "exp"> = {
    sub: params.userId,
    role: params.role,
    subRole: params.subRole,
    permissions: params.permissions,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload as unknown as AccessTokenPayload;
}
