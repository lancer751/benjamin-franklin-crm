import type { RoleAccess } from "@repo/database";
import type { Context } from "hono";
import type { CookieOptions } from "hono/utils/cookie";
import { createAccessToken, createCsrfToken, createRefreshToken } from "./jwt";
import { deleteCookie, setCookie } from "hono/cookie";
import { envParsed } from "@/env";

export const ACCESS_COOKIE_NAME = "bf_access_token";
export const REFRESH_COOKIE_NAME = "bf_refresh_token";
export const CSRF_COOKIE_NAME = "xxx-csrf-access-token";

function createCookieOptions(maxAge: number): CookieOptions {
  return {
    path: "/",
    secure: Boolean(envParsed.COOKIE_SECURE),
    httpOnly: true,
    maxAge,
    //expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
    sameSite: envParsed.COOKE_SAME_SITE as CookieOptions["sameSite"],
  };
}

function createCsrfCookieOptions(maxAge: number): CookieOptions {
  return {
    path: "/",
    secure: Boolean(envParsed.COOKIE_SECURE),
    httpOnly: false,
    maxAge,
    //expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
    sameSite: envParsed.COOKE_SAME_SITE as CookieOptions["sameSite"],
  };
}

export async function setAuthCookies(
  c: Context,
  userId: string,
  role: RoleAccess,
) {
  const accessToken = await createAccessToken(userId, role);
  const refreshToken = await createRefreshToken(userId, role);
  const csrfToken = createCsrfToken();

  const accessMaxAge = 60 * 15; // 15 minutes in seconds
  const refreshMaxAge = 60 * 60 * 24 * 7; // 7 days in seconds

  setCookie(
    c,
    ACCESS_COOKIE_NAME,
    accessToken,
    createCookieOptions(accessMaxAge),
  );
  setCookie(
    c,
    REFRESH_COOKIE_NAME,
    refreshToken,
    createCookieOptions(refreshMaxAge),
  );
  setCookie(
    c,
    CSRF_COOKIE_NAME,
    csrfToken,
    createCsrfCookieOptions(refreshMaxAge),
  );
}

export function clearAuthCookies(c: Context) {
  const clearOptions: CookieOptions = {
    secure: Boolean(envParsed.COOKIE_SECURE),
    sameSite: envParsed.COOKE_SAME_SITE as CookieOptions["sameSite"],
    path: "/",
  };

  deleteCookie(c, ACCESS_COOKIE_NAME, clearOptions);
  deleteCookie(c, REFRESH_COOKIE_NAME, clearOptions);
  deleteCookie(c, CSRF_COOKIE_NAME, clearOptions);
}