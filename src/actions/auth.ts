"use server";

import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  createTokenPair,
  deleteSessionForLogout,
  setAuthCookies,
  verifyAccessToken,
  verifyRefreshToken,
  verifyTelegramIdToken,
} from "@/lib/auth";

const MAX_POSTGRES_BIGINT = BigInt("9223372036854775807");

type TelegramUserProfile = {
  photoUrl?: string | null;
  username?: string | null;
};

async function getClientIpAddress() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const candidates = [
    ...(forwardedFor ? [forwardedFor.split(",")[0].trim()] : []),
    requestHeaders.get("x-real-ip")?.trim(),
  ];

  return candidates.find((candidate): candidate is string =>
    Boolean(candidate && isIP(candidate)),
  ) ?? null;
}

function getTelegramUserProfile(payload: Record<string, unknown>): TelegramUserProfile | null {
  const profile: TelegramUserProfile = { photoUrl: null };

  if ("picture" in payload) {
    if (payload.picture !== null && typeof payload.picture !== "string") {
      return null;
    }

    profile.photoUrl = payload.picture;
  }

  if ("preferred_username" in payload) {
    if (
      payload.preferred_username !== null &&
      (typeof payload.preferred_username !== "string" || payload.preferred_username.length > 32)
    ) {
      return null;
    }

    profile.username = payload.preferred_username;
  }

  return profile;
}

async function findOrCreateTelegramUser(
  telegramId: bigint,
  profile: TelegramUserProfile,
) {
  const [user] = await db
    .insert(users)
    .values({ telegramId, ...profile })
    .onConflictDoUpdate({
      target: users.telegramId,
      set: { telegramId, ...profile },
    })
    .returning({ id: users.id });

  if (!user) {
    throw new Error("Telegram user could not be created or loaded");
  }

  return user;
}

export async function handleTelegramAuth(data: {
  id_token?: string;
  user?: Record<string, unknown>;
  error?: string;
}) {
  if (data.error || !data.id_token) {
    return { success: false as const, error: "Не удалось войти через Telegram" };
  }

  const payload = await verifyTelegramIdToken(data.id_token);

  if (!payload || typeof payload.sub !== "string" || !/^\d{1,19}$/.test(payload.sub)) {
    return { success: false as const, error: "Ответ авторизации Telegram недействителен" };
  }

  const telegramId = BigInt(payload.sub);

  if (telegramId <= BigInt(0) || telegramId > MAX_POSTGRES_BIGINT) {
    return { success: false as const, error: "Идентификатор Telegram недействителен" };
  }

  const profile = getTelegramUserProfile(payload);

  if (!profile) {
    return { success: false as const, error: "Профиль Telegram недействителен" };
  }

  const user = await findOrCreateTelegramUser(telegramId, profile);
  const sessionId = randomUUID();
  const tokens = await createTokenPair(user.id, sessionId);
  const ipAddress = await getClientIpAddress();

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    refreshTokenHash: tokens.refreshTokenHash,
    ipAddress,
    expiresAt: tokens.refreshExpiresAt,
  });
  await setAuthCookies(tokens);

  return { success: true as const };
}

export async function logout() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  const accessClaims = await verifyAccessToken(accessToken);

  if (accessClaims) {
    await deleteSessionForLogout(accessClaims);
  }

  const refreshClaims = await verifyRefreshToken(refreshToken, true);

  if (refreshClaims && refreshToken) {
    await deleteSessionForLogout(refreshClaims, refreshToken);
  }

  await clearAuthCookies();
  return { success: true as const };
}
