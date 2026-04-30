import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const marketersRoute = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const marketers = await c.get("prisma").marketingProfile.findMany({});
    return c.json(marketers, 200);
  })
  .get(UUID_ROUTE, zValidator("json", validateIdParamSchema), async (c) => {
    const { id } = c.req.param();
    const marketer = await c.get("prisma").marketingProfile.findUnique({
      where: { id },
    });
    return c.json(marketer, 200);
  });
