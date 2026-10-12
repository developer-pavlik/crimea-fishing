import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
  clearAuthCookies,
  rotateRefreshToken,
} from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  const result = await rotateRefreshToken(refreshToken);

  if (!result.success) {
    if (result.error !== "refresh_token_reused") {
      await clearAuthCookies();
    }

    return Response.json({ error: result.error }, { status: 401 });
  }

  const { accessToken, refreshToken: rotatedRefreshToken } = result.tokens;
  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  cookieStore.set(REFRESH_COOKIE_NAME, rotatedRefreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
  return Response.json({ success: true });
}
