import type { AuthContext, ContextWithPrisma } from "@/lib/contextVariables";
import { ACCESS_COOKIE_NAME, CSRF_COOKIE_NAME } from "@/utils/cookie";
import type { AuthTokenPayload } from "@/utils/jwt";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

export const verifyUserAccessAuth = createMiddleware<AuthContext>(
  async (c: Context, next: Next) => {
    const accessToken = getCookie(c, ACCESS_COOKIE_NAME);
    if (!accessToken) {
      throw new HTTPException(401, { message: "Unathorized" });
    }

    const decoded: AuthTokenPayload = (await verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
      "HS256",
    )) as AuthTokenPayload;

    if (decoded.type !== "access") {
      throw new HTTPException(401, { message: "Unathorized" });
    }

    c.set("authUser", {
      userId: decoded.userId,
      role: decoded.role,
    });

    await next();
  },
);

export const verifyCsrfCookieCredentials = createMiddleware<AuthContext>(
  async (c: Context, next: Next) => {
    const csrfCookieValue = getCookie(c, CSRF_COOKIE_NAME);
    const csrfCookieHeader = c.req.header("xxx-csrf-access-token");

    if (
      !csrfCookieValue ||
      !csrfCookieHeader ||
      csrfCookieHeader !== csrfCookieValue
    ) {
      throw new HTTPException(403, { message: "Invalid csrf token" });
    }
    await next();
  },
);

export const verifyUserRoleAccess = createMiddleware<ContextWithPrisma>(
  async (c, next) => {
    if (!c.var.authUser || c.var.authUser.role !== "ADMIN") {
      throw new HTTPException(403, {
        message: "Forbidden or you don't have access to this route",
      });
    }
    await next();
  },
);