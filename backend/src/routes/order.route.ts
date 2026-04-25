import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateOrderSchema, UpdateOrderSchema } from "shared";
import { faker } from "@faker-js/faker";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import withPrisma from "@/lib/prisma";

export const orderRoutes = new Hono<ContextWithPrisma>()
  // Get all orders
  .get("/", withPrisma, async (c) => {
    const orders = await c.get("prisma").order.findMany({
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
        lead: true,
        seller: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: orders,
      },
      200
    );
  })
  // Get order by ID
  .get(UUID_ROUTE, withPrisma, zValidator("param", z.object({ id: z.string().uuid().length(36) })), async (c) => {
    const { id } = c.req.valid("param");

    const order = await c.get("prisma").order.findUnique({
      where: { id },
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
        lead: true,
        seller: true,
        paymentPlans: {
          include: {
            installments: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new HTTPException(404, { message: "Order not found" });
    }

    return c.json<SuccessResponse<typeof order>>(
      {
        success: true,
        data: order,
        message: "Order retrieved successfully",
      },
      200
    );
  })
  // Create new order
  .post("/", withPrisma, zValidator("json", CreateOrderSchema), async (c) => {
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
        orderDetails: {
          include: {
            product: true,
          },
        },
        lead: true,
        seller: true,
      },
    });

    return c.json<SuccessResponse<typeof generatedOrder>>(
      {
        success: true,
        message: "Order created successfully",
        data: generatedOrder,
      },
      201
    );
  })
  // Update order (careful with status changes)
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    zValidator("json", UpdateOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const orderData = c.req.valid("json");
      const { order_items, ...orderToUpdate } = structuredClone(orderData);

      const existingOrder = await c
        .get("prisma")
        .order.findUnique({
          where: { id },
          include: {
            orderDetails: true,
            payments: true,
          },
        });

      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      // Prevent status change to COMPLETED if there are unpaid installments
      if (
        orderToUpdate.order_status === "COMPLETED" &&
        existingOrder.order_status !== "COMPLETED"
      ) {
        const payments = await c
          .get("prisma")
          .payment.findMany({
            where: { order_id: id },
          });

        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount as unknown as string), 0);
        if (totalPaid < parseFloat(existingOrder.total_amount as unknown as string)) {
          throw new HTTPException(400, {
            message:
              "Cannot complete order with unpaid balance. Create payments first.",
          });
        }
      }

      const updatedOrder = await c.get("prisma").$transaction(async (tx) => {
        // Handle order items update if provided
        if (order_items && order_items.length > 0) {
          // Delete old order details
          await tx.orderDetail.deleteMany({
            where: { order_id: id },
          });

          // Create new order details
          await tx.orderDetail.createMany({
            data: order_items.map((item) => ({
              ...item,
              order_id: id,
            })),
          });
        }

        return tx.order.update({
          where: { id },
          data: orderToUpdate,
          include: {
            orderDetails: {
              include: {
                product: true,
              },
            },
            lead: true,
            seller: true,
          },
        });
      });

      return c.json<SuccessResponse<typeof updatedOrder>>(
        {
          success: true,
          message: "Order updated successfully",
          data: updatedOrder,
        },
        200
      );
    }
  )
  // Delete order (only if not completed or has payments)
  .delete(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existingOrder = await c
        .get("prisma")
        .order.findUnique({
          where: { id },
          include: {
            orderDetails: true,
            payments: true,
            paymentPlans: true,
          },
        });

      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      // Prevent deletion of completed orders
      if (existingOrder.order_status === "COMPLETED") {
        throw new HTTPException(400, {
          message:
            "Cannot delete completed orders. Mark as CANCELLED instead.",
        });
      }

      // Prevent deletion if there are confirmed payments
      const confirmedPayments = existingOrder.payments.filter(
        (p) => p.payment_status === "CONFIRMED"
      );
      if (confirmedPayments.length > 0) {
        throw new HTTPException(400, {
          message:
            "Cannot delete order with confirmed payments. Create refunds instead.",
        });
      }

      // Delete the order (cascade will handle orderDetails due to foreign key)
      await c.get("prisma").$transaction(async (tx) => {
        // Delete payment plans
        if (existingOrder.paymentPlans.length > 0) {
          for (const plan of existingOrder.paymentPlans) {
            await tx.scheduledPayment.deleteMany({
              where: { payment_plan_id: plan.id },
            });
          }
          await tx.paymentPlan.deleteMany({
            where: { order_id: id },
          });
        }

        // Delete payments
        await tx.payment.deleteMany({
          where: { order_id: id },
        });

        // Delete order details
        await tx.orderDetail.deleteMany({
          where: { order_id: id },
        });

        // Delete order
        await tx.order.delete({
          where: { id },
        });
      });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Order deleted successfully",
        },
        200
      );
    }
  );
