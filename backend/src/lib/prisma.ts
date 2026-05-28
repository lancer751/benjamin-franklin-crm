import type { Context, Next } from "hono";
import { prisma } from "@repo/database";

function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }
  return next();
}

export default withPrisma;
