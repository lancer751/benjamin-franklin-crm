import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import prisma from "@/lib/prisma";
import {
  createOrderSchema,
  updateOrderSchema,
} from "@/zod-schemas/order.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const orderRoutes = new Hono()
  .get("/", async (c) => {
    const orders = await prisma.order.findMany({});
    return c.json(orders, 200);
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      return c.json(order, 200);
    },
  )
  .post("/", zValidator("json", createOrderSchema), async (c) => {
    const orderData = c.req.valid("json");
    const newOrder = await prisma.order.create({ data: orderData });
    return c.json<SuccessResponse<typeof newOrder>>({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    }, 201);
  })
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", updateOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const orderData = c.req.valid("json");
      const existingOrder = await prisma.order.findUnique({ where: { id } });
      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: orderData,
      });
      return c.json<SuccessResponse<typeof updatedOrder>>({
        success: true,
        message: "Order updated successfully",
        data: updatedOrder,
      });
    },
  )
  .delete(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const existingOrder = await prisma.order.findUnique({ where: { id } });
      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      await prisma.order.delete({ where: { id } });
      return c.json<SuccessResponse>({
        success: true,
        message: "Order deleted successfully",
      }, 200);
    },
  );
