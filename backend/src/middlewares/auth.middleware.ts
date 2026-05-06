import type { AuthContext } from "@/lib/contextVariables";
import { ACCESS_COOKIE_NAME } from "@/utils/cookie";
import type { AuthTokenPayload } from "@/utils/jwt";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

export const verifyUserAccessAuth = createMiddleware<AuthContext>(
  async (c: Context, next: Next) => {
    const accessToken = getCookie(c, ACCESS_COOKIE_NAME);
    console.log(accessToken)
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
