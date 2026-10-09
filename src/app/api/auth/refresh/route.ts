import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import {
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  createTokenPair,
  matchesRefreshTokenHash,
  setAuthCookies,
  verifyRefreshToken,
} from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  const claims = await verifyRefreshToken(refreshToken);

  if (!refreshToken || !claims) {
    await clearAuthCookies();
    return Response.json({ error: "invalid_refresh_token" }, { status: 401 });
  }

  const now = new Date();
  const [session] = await db
    .select({
      userId: sessions.userId,
      refreshTokenHash: sessions.refreshTokenHash,
    })
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
    await clearAuthCookies();
    return Response.json({ error: "session_expired" }, { status: 401 });
  }

  if (!matchesRefreshTokenHash(refreshToken, session.refreshTokenHash)) {
    return Response.json({ error: "refresh_token_reused" }, { status: 401 });
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
    return Response.json({ error: "refresh_token_reused" }, { status: 401 });
  }

  await setAuthCookies(tokens);
  return Response.json({ success: true });
}
