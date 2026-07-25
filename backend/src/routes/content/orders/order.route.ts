import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateOrderSchema, OrderQuerySchema, UpdateOrderSchema } from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import withPrisma from "@/lib/prisma";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { orderRepository } from "@/repositories/order.repository";



export const orderRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR", "MARKETING"),
  )
  .get("/", zValidator("query", OrderQuerySchema), async (c) => {
    const repo = orderRepository(c.get("prisma"));
    const query = c.req.valid("query");
    const result = await repo.findMany(query);

    return c.json<SuccessResponse<typeof result>>(
      { success: true, message: "Orders retrieved", data: result },
      200,
    );
  })
  .post("/", zValidator("json", CreateOrderSchema), async (c) => {
    
  })