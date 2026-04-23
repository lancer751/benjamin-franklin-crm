import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import {
  createOrderSchema,
  updateOrderSchema,
} from "shared";
import { faker } from "@faker-js/faker";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {z} from "zod";

export const orderRoutes = new Hono<ContextWithPrisma>()
  .get("/", async (c) => {
    const orders = await c.get("prisma").order.findMany({});
    return c.json(orders, 200);
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const order = await c.get("prisma").order.findUnique({ where: { id }, include: {
        orderDetails: true
      }});

      if (!order) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      return c.json(order, 200);
    },
  )
  .post("/", zValidator("json", createOrderSchema), async (c) => {
    const orderData = c.req.valid("json");
    const { order_items, ...newOrderData } = structuredClone(orderData);

    const generatedOrder = await c.get("prisma").order.create({
      data: {
        ...newOrderData,
        order_code: faker.string.alpha({ length: 7, casing: "upper" }),
        orderDetails: {
          createMany: { data: order_items },
        },
      },
      include: {
        orderDetails: true,
      },
    });

    return c.json<SuccessResponse<typeof generatedOrder>>(
      {
        success: true,
        message: "Order created successfully",
        data: generatedOrder,
      },
      201,
    );
  })
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", updateOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const orderData = c.req.valid("json");
      const { order_items, ...orderToUpdate } = structuredClone(orderData);
      const existingOrder = await c.get("prisma").order.findUnique({ where: { id } });
      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      const updatedOrder = await c.get("prisma").order.update({
        where: { id },
        data: {
          ...orderToUpdate,
          orderDetails: order_items
            ? {
                updateMany: order_items.map((item) => ({
                  where: { product_id: item.product_id },
                  data: item,
                })),
              }
            : undefined,
        },
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
      const existingOrder = await c.get("prisma").order.findUnique({ where: { id } });
      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      await c.get("prisma").order.delete({
        where: {
          id,
          orderDetails: {
            every: {
              order_id: id,
            },
          },
        },
      });
      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Order deleted successfully",
        },
        200,
      );
    },
  );
