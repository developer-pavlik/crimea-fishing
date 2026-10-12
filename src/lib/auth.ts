import "server-only";

import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { createRemoteJWKSet, errors, jwtVerify, SignJWT } from "jose";
import { db } from "@/db";
import { sessions } from "@/db/schema";

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

const TOKEN_ISSUER = "crimea-fishing";
const TOKEN_AUDIENCE = "crimea-fishing-web";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AuthSessionClaims {
  userId: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshExpiresAt: Date;
}

export type RefreshTokenRotationResult =
  | { success: true; tokens: TokenPair }
  | { success: false; error: "invalid_refresh_token" | "session_expired" | "refresh_token_reused" };

let telegramJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getTelegramJwks() {
  const jwksUrl = process.env.TELEGRAM_JWKS_URL;

  if (!jwksUrl) {
    throw new Error("TELEGRAM_JWKS_URL is not configured");
  }

  telegramJwks ??= createRemoteJWKSet(new URL(jwksUrl));
  return telegramJwks;
}

function getClientId() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_TELEGRAM;

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_CLIENT_ID_TELEGRAM is not configured");
  }

  return clientId;
}

function getSigningKey(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET") {
  const secret = process.env[name];

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(`${name} must be configured with at least 32 bytes`);
  }

  return new TextEncoder().encode(secret);
}

function getTokenKeys() {
  const accessKey = getSigningKey("JWT_ACCESS_SECRET");
  const refreshKey = getSigningKey("JWT_REFRESH_SECRET");

  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
  }

  return { accessKey, refreshKey };
}

export async function verifyTelegramIdToken(token: string) {
  if (!token || token.length > 16_384) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getTelegramJwks(), {
      issuer: "https://oauth.telegram.org",
      audience: getClientId(),
      clockTolerance: "30s",
    });

    return payload;
  } catch (error) {
    if (error instanceof errors.JWKSTimeout) {
      throw error;
    }

    if (error instanceof errors.JOSEError) {
      return null;
    }

    throw error;
  }
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function matchesRefreshTokenHash(token: string, storedHash: string) {
  if (!/^[0-9a-f]{64}$/i.test(storedHash)) {
    return false;
  }

  const candidateHash = Buffer.from(hashRefreshToken(token), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");
  return timingSafeEqual(candidateHash, expectedHash);
}

async function createAppToken(
  userId: string,
  sessionId: string,
  tokenUse: "access" | "refresh",
  expiresAt: Date,
) {
  const { accessKey, refreshKey } = getTokenKeys();
  const key = tokenUse === "access" ? accessKey : refreshKey;
  const issuedAt = Math.floor(Date.now() / 1000);

  return new SignJWT({ sessionId, tokenUse })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setSubject(userId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setJti(randomUUID())
    .sign(key);
}

export async function createTokenPair(userId: string, sessionId: string): Promise<TokenPair> {
  const now = Date.now();
  const accessExpiresAt = new Date(now + ACCESS_TOKEN_TTL_SECONDS * 1000);
  const refreshExpiresAt = new Date(now + REFRESH_TOKEN_TTL_SECONDS * 1000);
  const [accessToken, refreshToken] = await Promise.all([
    createAppToken(userId, sessionId, "access", accessExpiresAt),
    createAppToken(userId, sessionId, "refresh", refreshExpiresAt),
  ]);

  return {
    accessToken,
    refreshToken,
    refreshTokenHash: hashRefreshToken(refreshToken),
    refreshExpiresAt,
  };
}

async function verifyAppToken(
  token: string | undefined,
  tokenUse: "access" | "refresh",
  allowExpired = false,
): Promise<AuthSessionClaims | null> {
  if (!token || token.length > 8_192) {
    return null;
  }

  const { accessKey, refreshKey } = getTokenKeys();
  const key = tokenUse === "access" ? accessKey : refreshKey;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      clockTolerance: tokenUse === "access" ? 0 : "5s",
      requiredClaims: ["exp", "iat", "sub", "sessionId", "tokenUse"],
      ...(allowExpired
        ? { ignoreExp: true }
        : { maxTokenAge: `${tokenUse === "access" ? ACCESS_TOKEN_TTL_SECONDS : REFRESH_TOKEN_TTL_SECONDS}s` }),
    });

    if (
      payload.tokenUse !== tokenUse ||
      typeof payload.sub !== "string" ||
      !UUID_PATTERN.test(payload.sub) ||
      typeof payload.sessionId !== "string" ||
      !UUID_PATTERN.test(payload.sessionId)
    ) {
      return null;
    }

    return { userId: payload.sub, sessionId: payload.sessionId };
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      return null;
    }

    throw error;
  }
}

export function verifyAccessToken(token: string | undefined) {
  return verifyAppToken(token, "access");
}

export function verifyRefreshToken(token: string | undefined, allowExpired = false) {
  return verifyAppToken(token, "refresh", allowExpired);
}

export async function rotateRefreshToken(
  refreshToken: string | undefined,
): Promise<RefreshTokenRotationResult> {
  const claims = await verifyRefreshToken(refreshToken);

  if (!refreshToken || !claims) {
    return { success: false, error: "invalid_refresh_token" };
  }

  const now = new Date();
  const [session] = await db
    .select({ refreshTokenHash: sessions.refreshTokenHash })
    .from(sessions)
    .where(
      and(
        eq(sessions.id, claims.sessionId),
        eq(sessions.userId, claims.userId),
        gt(sessions.expiresAt, now),
      ),
    )
    .limit(1);

  if (!session) {
    return { success: false, error: "session_expired" };
  }

  if (!matchesRefreshTokenHash(refreshToken, session.refreshTokenHash)) {
    return { success: false, error: "refresh_token_reused" };
  }

  const tokens = await createTokenPair(claims.userId, claims.sessionId);
  const [updatedSession] = await db
    .update(sessions)
    .set({
      refreshTokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshExpiresAt,
    })
    .where(
      and(
        eq(sessions.id, claims.sessionId),
        eq(sessions.userId, claims.userId),
        eq(sessions.refreshTokenHash, session.refreshTokenHash),
        gt(sessions.expiresAt, now),
      ),
    )
    .returning({ id: sessions.id });

  if (!updatedSession) {
    return { success: false, error: "refresh_token_reused" };
  }

  return { success: true, tokens };
}

export async function getAccessSession() {
  const cookieStore = await cookies();
  return verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
}

export async function hasAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.has(ACCESS_COOKIE_NAME) || cookieStore.has(REFRESH_COOKIE_NAME);
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(tokens: Pick<TokenPair, "accessToken" | "refreshToken">) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  cookieStore.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function deleteSessionForLogout(
  claims: AuthSessionClaims,
  refreshToken?: string,
) {
  if (refreshToken) {
    await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.id, claims.sessionId),
          eq(sessions.userId, claims.userId),
          eq(sessions.refreshTokenHash, hashRefreshToken(refreshToken)),
        ),
      );
    return;
  }

  await db
    .delete(sessions)
    .where(and(eq(sessions.id, claims.sessionId), eq(sessions.userId, claims.userId)));
}
