import type { Context, Next } from "hono";
import { prisma } from "@repo/database";

const databaseUrl = `${process.env.DATABASE_URL}`;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }
  return next();
}

export default withPrisma;
