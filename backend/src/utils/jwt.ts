import { envParsed } from "@/env";
import type { RoleAccess } from "@repo/database";
import { sign } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import crypto from "node:crypto";

export type AuthTokenPayload = {
  userId: string;
  role: RoleAccess;
  type: "access" | "refresh";
} & JWTPayload;

export function createAccessToken(
  userId: string,
  role: RoleAccess,
): Promise<string> {
  const payload: AuthTokenPayload = {
    userId,
    role,
    exp:
      Math.floor(Date.now() / 1000) +
      60 * envParsed.ACCESS_TOKEN_EXP_TIME, // in minutes
    type: "access",
  };
  return sign(payload, envParsed.ACCESS_TOKEN_SECRET, "HS256");
}

export function createRefreshToken(
  userId: string,
  role: RoleAccess,
): Promise<string> {
  const payload: AuthTokenPayload = {
    userId,
    role,
    exp:
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * envParsed.REFRESH_TOKEN_EXP_TIME, // in days
    type: "refresh",
  };

  return sign(payload, envParsed.REFRESH_TOKEN_SECRET, "HS256");
}

export function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}
