import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
  rotateRefreshToken,
  verifyAccessToken,
} from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/auth/refresh") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (await verifyAccessToken(accessToken)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const result = await rotateRefreshToken(refreshToken);

  if (!result.success) {
    return NextResponse.next();
  }

  const { accessToken: rotatedAccessToken, refreshToken: rotatedRefreshToken } = result.tokens;
  request.cookies.set(ACCESS_COOKIE_NAME, rotatedAccessToken);
  request.cookies.set(REFRESH_COOKIE_NAME, rotatedRefreshToken);

  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.cookies.set(ACCESS_COOKIE_NAME, rotatedAccessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  response.cookies.set(REFRESH_COOKIE_NAME, rotatedRefreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
