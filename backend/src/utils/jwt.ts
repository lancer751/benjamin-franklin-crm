import type { RoleAccess } from "@repo/database";
import { sign } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";


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
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // Token expires in 5 minutes
    type: "access"
  };

  return sign(payload, process.env.ACCESS_TOKEN_SECRET!, "HS256");
}

export function createRefreshToken(
  userId: string,
  role: RoleAccess,
): Promise<string> {
  const payload: AuthTokenPayload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Token expires in 7 days
    type: "refresh"
  };

  return sign(payload, process.env.REFRESH_TOKEN_SECRET!, "HS256");
}