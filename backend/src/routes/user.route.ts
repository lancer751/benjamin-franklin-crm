import { Hono } from "hono";
import withPrisma from "@/lib/prisma";
import type { ContextWithPrisma } from "@/lib/contextVariables";

const userRoutes = new Hono<ContextWithPrisma>()
  .get("/marketers", withPrisma, async (c) => {
    const marketers = await c.get("prisma").marketingProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            email: true,
            is_active: true,
          },
        },
      },
    });

    return c.json(
      {
        success: true,
        data: marketers,
      },
      200
    );
  })
  .get("/sales-supervisors", withPrisma, async (c) => {
    const supervisors = await c.get("prisma").salesSupervisorProfile.findMany({})
    return c.json(supervisors, 200)
})