import { REFRESH_TOKEN_TTL_SECONDS } from "@ebraz/config";
import { prisma } from "@ebraz/database";
import type { DbUserRole } from "@ebraz/types";
import { generateSecureToken, hashToken } from "@ebraz/utils/crypto";
import { randomUUID } from "node:crypto";

export interface RefreshTokenResult {
  refreshToken: string;
  expiresAt: Date;
  familyId: string;
}

export async function createRefreshToken(params: {
  userId: string;
  userRole: DbUserRole;
  familyId?: string;
}): Promise<RefreshTokenResult> {
  const refreshToken = generateSecureToken(48);
  const tokenHash = hashToken(refreshToken);
  const familyId = params.familyId ?? randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: params.userId,
      userRole: params.userRole,
      familyId,
      expiresAt,
    },
  });

  return { refreshToken, expiresAt, familyId };
}

export async function rotateRefreshToken(currentToken: string): Promise<RefreshTokenResult> {
  const tokenHash = hashToken(currentToken);

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!existing || existing.revokedAt || existing.deletedAt) {
    if (existing?.familyId) {
      await revokeTokenFamily(existing.familyId);
    }
    throw new Error("Invalid refresh token");
  }

  if (existing.expiresAt < new Date()) {
    await revokeTokenFamily(existing.familyId);
    throw new Error("Refresh token expired");
  }

  const newRefreshToken = generateSecureToken(48);
  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existing.id },
      data: {
        revokedAt: new Date(),
        replacedBy: newTokenHash,
      },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: existing.userId,
        userRole: existing.userRole,
        familyId: existing.familyId,
        expiresAt,
      },
    }),
  ]);

  return {
    refreshToken: newRefreshToken,
    expiresAt,
    familyId: existing.familyId,
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeTokenFamily(familyId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserTokens(userId: string, userRole: DbUserRole): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, userRole, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
