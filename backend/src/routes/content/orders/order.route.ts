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
import type { AttendanceMode, Decimal, PrismaClient } from "@repo/database";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";

async function generateUniqueOrderCode(prisma: PrismaClient) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = faker.string.alpha({ length: 7, casing: "upper" });
    const exists = await prisma.order.findUnique({
      where: { order_code: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new HTTPException(500, {
    message: "Could not generate a unique order code, please retry",
  });
}

// Resolves order_items (product_id + attendance_mode) against real
// ProductPrice rows and returns priced line items + computed totals.
// Throws 404/422 if a product/price/discount doesn't check out.
async function priceOrderItems(
  prisma: PrismaClient,
  items: {
    product_id: string;
    attendance_mode: AttendanceMode;
    discount_code?: string | null;
  }[],
  discount?: string,
) {
  const prices = await prisma.productPrice.findMany({
    where: {
      OR: items.map((i) => ({
        product_id: i.product_id,
        attendance_mode: i.attendance_mode,
      })),
    },
  });

  const priceMap = new Map(
    prices.map((p) => [`${p.product_id}:${p.attendance_mode}`, p]),
  );

  const resolvedItems = items.map((item) => {
    const price = priceMap.get(`${item.product_id}:${item.attendance_mode}`);
    if (!price) {
      throw new HTTPException(422, {
        message: `No price found for product ${item.product_id} with attendance mode ${item.attendance_mode}`,
      });
    }
    return {
      product_id: item.product_id,
      price: price.cash_price,
      discount_code: item.discount_code ?? null,
    };
  });

  // NOTE: using Number() on decimal strings here for simplicity, matching
  // the rest of the codebase's parseFloat usage. For real production-grade
  // money math, swap this for a fixed-point/decimal library (e.g. decimal.js)
  // to avoid floating point rounding drift.
  const subTotal = resolvedItems.reduce((sum, i) => sum + Number(i.price), 0);
  const discountAmount = discount ? Number(discount) : 0;

  if (discountAmount < 0 || discountAmount > subTotal) {
    throw new HTTPException(400, {
      message: "Discount must be between 0 and the order subtotal",
    });
  }

  const totalAmount = subTotal - discountAmount;

  return {
    resolvedItems,
    subTotal: subTotal.toFixed(2),
    discountAmount: discountAmount ? discountAmount.toFixed(2) : undefined,
    totalAmount: totalAmount.toFixed(2),
  };
}

const orderInclude = {
  orderDetails: { include: { product: true } },
  lead: true,
  seller: { include: { user: true } },
} as const;

export const orderRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  // NOTE: adjust roles to whatever actually needs order visibility/creation
  // in your org — I've mirrored the role set used on leads/products.
  .use(
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR", "MARKETING"),
  )

  .get("/", async (c) => {
    const orders = await c.get("prisma").order.findMany({
      include: orderInclude,
      orderBy: { created_at: "desc" },
    });

    return c.json<SuccessResponse<typeof orders>>(
      { success: true, message: "Orders retrieved", data: orders },
      200,
    );
  })

  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const order = await c.get("prisma").order.findUnique({
        where: { id },
        include: {
          ...orderInclude,
          paymentPlans: { include: { installments: true } },
          payments: true,
        },
      });

      if (!order) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      return c.json<SuccessResponse<typeof order>>(
        { success: true, data: order, message: "Order retrieved successfully" },
        200,
      );
    },
  )

  .post(
    "/",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("json", CreateOrderSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { lead_id, order_items, discount } = c.req.valid("json");

      const lead = await prisma.lead.findUnique({
        where: { id: lead_id },
        select: { id: true, deleted_at: true },
      });
      if (!lead || lead.deleted_at) {
        throw new HTTPException(404, { message: "Lead not found" });
      }

      const { resolvedItems, subTotal, discountAmount, totalAmount } =
        await priceOrderItems(prisma, order_items, discount);

      const orderCode = await generateUniqueOrderCode(prisma);

      const generatedOrder = await prisma.order.create({
        data: {
          lead_id,
          generated_by: c.var.authUser.userId,
          sub_total: subTotal,
          total_amount: totalAmount,
          discount: discountAmount,
          order_status: "PENDING",
          order_code: orderCode,
          orderDetails: { createMany: { data: resolvedItems } },
        },
        include: orderInclude,
      });

      return c.json<SuccessResponse<typeof generatedOrder>>(
        {
          success: true,
          message: "Order created successfully",
          data: generatedOrder,
        },
        201,
      );
    },
  )

  .put(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", z.object({ id: z.string().length(36) })),
    zValidator("json", UpdateOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { order_items, discount, order_status } = c.req.valid("json");
      const prisma = c.get("prisma");

      const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: { orderDetails: true, payments: true },
      });

      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      // Re-price line items first (if provided) so the COMPLETED check below
      // compares against the order's up-to-date total, not a stale one.
      let newTotals:
        | {
            resolvedItems: {
              product_id: string;
              price: Decimal;
              discount_code: string | null;
            }[];
            subTotal: string;
            discountAmount?: string;
            totalAmount: string;
          }
        | undefined;

      if (order_items) {
        newTotals = await priceOrderItems(prisma, order_items, discount);
      }

      const effectiveTotal = newTotals
        ? Number(newTotals.totalAmount)
        : parseFloat(existingOrder.total_amount as unknown as string);

      if (
        order_status === "COMPLETED" &&
        existingOrder.order_status !== "COMPLETED"
      ) {
        const payments = await prisma.payment.findMany({
          where: { order_id: id, payment_status: "CONFIRMED" },
        });
        const totalPaid = payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        );
        if (totalPaid < effectiveTotal) {
          throw new HTTPException(400, {
            message:
              "Cannot complete order with unpaid balance. Create payments first.",
          });
        }
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        if (newTotals) {
          await tx.orderDetail.deleteMany({ where: { order_id: id } });
          await tx.orderDetail.createMany({
            data: newTotals.resolvedItems.map((item) => ({
              ...item,
              order_id: id,
            })),
          });
        }

        return tx.order.update({
          where: { id },
          data: {
            order_status,
            ...(newTotals && {
              sub_total: newTotals.subTotal,
              total_amount: newTotals.totalAmount,
              discount: newTotals.discountAmount,
            }),
          },
          include: orderInclude,
        });
      });

      return c.json<SuccessResponse<typeof updatedOrder>>(
        {
          success: true,
          message: "Order updated successfully",
          data: updatedOrder,
        },
        200,
      );
    },
  )

  .delete(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"),
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const prisma = c.get("prisma");

      const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: { orderDetails: true, payments: true, paymentPlans: true },
      });

      if (!existingOrder) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      if (existingOrder.order_status === "COMPLETED") {
        throw new HTTPException(400, {
          message: "Cannot delete completed orders. Mark as CANCELLED instead.",
        });
      }

      const confirmedPayments = existingOrder.payments.filter(
        (p) => p.payment_status === "CONFIRMED",
      );
      if (confirmedPayments.length > 0) {
        throw new HTTPException(400, {
          message:
            "Cannot delete order with confirmed payments. Create refunds instead.",
        });
      }

      await prisma.$transaction(async (tx) => {
        if (existingOrder.paymentPlans.length > 0) {
          for (const plan of existingOrder.paymentPlans) {
            await tx.scheduledPayment.deleteMany({
              where: { payment_plan_id: plan.id },
            });
          }
          await tx.paymentPlan.deleteMany({ where: { order_id: id } });
        }
        await tx.payment.deleteMany({ where: { order_id: id } });
        await tx.orderDetail.deleteMany({ where: { order_id: id } });
        await tx.order.delete({ where: { id } });
      });

      return c.json<SuccessResponse>(
        { success: true, message: "Order deleted successfully" },
        200,
      );
    },
  );
