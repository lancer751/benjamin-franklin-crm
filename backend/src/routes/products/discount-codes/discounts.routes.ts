// discount-code.route.ts — who can mint codes is your call; ADMIN + SALES_SUPERVISOR fits

import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserAccessAuth, verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateDiscountCodeSchema } from "shared";

// the approval-authority pattern the SalesSupervisorProfile fields already imply.
export const discountCodeRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"))
  .post("/", zValidator("json", CreateDiscountCodeSchema), async (c) => {
    const data = c.req.valid("json");
    const prisma = c.get("prisma");

    const existing = await prisma.discountCode.findUnique({ where: { code: data.code } });
    if (existing) throw new HTTPException(409, { message: "Code already exists" });

    if (data.product_id) {
      const product = await prisma.product.findUnique({ where: { id: data.product_id } });
      if (!product) throw new HTTPException(404, { message: "Product not found" });
    }

    const created = await prisma.discountCode.create({
      data: { ...data, created_by: c.var.authUser.userId },
    });
    return c.json({ success: true, message: "Discount code created", data: created }, 201);
  });