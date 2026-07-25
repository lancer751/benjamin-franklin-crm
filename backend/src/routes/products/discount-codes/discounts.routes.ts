// discount-code.route.ts — who can mint codes is your call; ADMIN + SALES_SUPERVISOR fits

import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserAccessAuth, verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import type { DiscountCodeWhereInput } from "@repo/database";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateDiscountCodeSchema, DiscountCodeQuerySchema } from "shared";

export const discountCodeRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"))
  .get("/", zValidator("query", DiscountCodeQuerySchema),async (c) => {
    const {page, limit, type, valid_from, valid_until, is_active, user_id} = c.req.valid("query")
    const skip = limit * (page - 1)
    const prisma = c.get("prisma")

    const where: DiscountCodeWhereInput = {
      AND: {
        ...(type && {type}),
        ...(valid_from && {valid_from: {
          gte: valid_from
        }}),
        ...(valid_until && {valid_until: {
          lte: valid_until
        }}),
        ...(is_active && {is_active}),
        ...(user_id && {creator: {id: user_id}})
      },
    } 

    const [discountCodes, total] = await Promise.all([prisma.discountCode.findMany({
      where,
      orderBy: {
        created_at: "desc"
      },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    }), prisma.discountCode.count({where})])

    const result = {
      discountCodes,
      total,
      page,
      limit
    } 

    return c.json<SuccessResponse<typeof result>>({
      success: true,
      message: "Paginated Discounts codes",
      data: result
    })
  })
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