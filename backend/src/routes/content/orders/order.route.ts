import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateOrderSchema, OrderQuerySchema, UpdateOrderSchema } from "shared";
import { faker } from "@faker-js/faker";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import withPrisma from "@/lib/prisma";
import type { AttendanceMode, Decimal, PaymentType, PrismaClient } from "@repo/database";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { orderRepository } from "@/repositories/order.repository";

async function resolveDiscount(
  prisma: PrismaClient,
  codeStr: string,
  productId: string,
  baseAmount: number,
  maxDeductible: number, // baseAmount − enrollment_fee: discount can't eat into the fee
): Promise<{ id: string; amount: number }> {
  const code = await prisma.discountCode.findUnique({ where: { code: codeStr } });

  if (!code || !code.is_active) throw new HTTPException(422, { message: `Code "${codeStr}" is invalid or inactive` });
  if (code.product_id && code.product_id !== productId) {
    throw new HTTPException(422, { message: `Code "${codeStr}" doesn't apply to this product` });
  }
  const now = new Date();
  if (code.valid_from && code.valid_from > now) throw new HTTPException(422, { message: `Code "${codeStr}" isn't active yet` });
  if (code.valid_until && code.valid_until < now) throw new HTTPException(422, { message: `Code "${codeStr}" has expired` });
  if (code.max_uses !== null && code.times_used >= code.max_uses) {
    throw new HTTPException(422, { message: `Code "${codeStr}" has reached its usage limit` });
  }

  const raw = code.type === "PERCENTAGE" ? baseAmount * (Number(code.value) / 100) : Number(code.value);
  const amount = Math.min(raw, maxDeductible); // never discounts into the enrollment-fee portion

  return { id: code.id, amount };
}

async function priceOrderItems(
  prisma: PrismaClient,
  items: { product_id: string; attendance_mode: AttendanceMode; payment_modality: PaymentType; discount_code?: string }[],
) {
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.product_id) } },
    select: { id: true, edition: { select: { modality: true } }, prices: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const resolvedItems: any[] = [];
  const codesUsed: string[] = []; // to increment times_used after everything validates
  let subTotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) throw new HTTPException(404, { message: `Product ${item.product_id} not found` });

    const isHibrido = product.edition.modality === "HIBRIDO";
    const isAsincronico = product.edition.modality === "ASINCRONICO";

    // For non-HIBRIDO editions, attendance_mode is system-determined (HEREDADO),
    // not something the seller picks — reject a client-supplied mismatch here
    // rather than silently overriding it.
    const expectedMode = isHibrido ? item.attendance_mode : "HEREDADO";
    const priceRow = product.prices.find((p) => p.attendance_mode === expectedMode);
    if (!priceRow) {
      throw new HTTPException(422, { message: `No price found for product ${item.product_id} (${expectedMode})` });
    }
    if (isHibrido && item.attendance_mode !== "VIRTUAL" && item.attendance_mode !== "PRESENCIAL") {
      throw new HTTPException(400, { message: `HIBRIDO products require attendance_mode VIRTUAL or PRESENCIAL` });
    }

    if (item.payment_modality === "INSTALLMENTS" && (isAsincronico || priceRow.installment_price === null)) {
      throw new HTTPException(422, { message: `Product ${item.product_id} is cash-only (ASINCRONICO)` });
    }

    const baseAmount = Number(item.payment_modality === "CASH" ? priceRow.cash_price : priceRow.installment_price);
    const enrollmentFee = isAsincronico || priceRow.enrollment_fee === null ? 0 : Number(priceRow.enrollment_fee);

    let discountCodeId: string | null = null;
    let discountAmount = 0;
    if (item.discount_code) {
      const resolved = await resolveDiscount(prisma, item.discount_code, item.product_id, baseAmount, baseAmount - enrollmentFee);
      discountCodeId = resolved.id;
      discountAmount = resolved.amount;
      codesUsed.push(item.discount_code);
    }

    const price = baseAmount - discountAmount; // enrollment_fee is PART of this, not added on top
    subTotal += baseAmount;
    discountTotal += discountAmount;

    resolvedItems.push({
      product_id: item.product_id,
      attendance_mode: expectedMode,
      payment_modality: item.payment_modality,
      base_price: baseAmount.toFixed(2),
      enrollment_fee: enrollmentFee.toFixed(2),
      discount_code_id: discountCodeId,
      discount_amount: discountAmount.toFixed(2),
      price: price.toFixed(2),
    });
  }

  return {
    resolvedItems,
    codesUsed,
    subTotal: subTotal.toFixed(2),
    discount: discountTotal.toFixed(2),
    totalAmount: (subTotal - discountTotal).toFixed(2),
  };
}

export const orderRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  // NOTE: adjust roles to whatever actually needs order visibility/creation
  // in your org — I've mirrored the role set used on leads/products.
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
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const repo = orderRepository(c.get("prisma"));
      const order = await repo.findById(id);
      if (!order) {
        throw new HTTPException(404, { message: "Order not found" });
      }

      return c.json<SuccessResponse<typeof order>>(
        { success: true, data: order, message: "Order retrieved successfully" },
        200,
      );
    },
  )
  .post("/", zValidator("json", CreateOrderSchema), async (c) => {
    const prisma = c.get("prisma");
    const authUser = c.var.authUser;
    const {
      lead_id,
      order_items,
      seller_id: requestedSellerId,
    } = c.req.valid("json");

    const lead = await prisma.lead.findUnique({
      where: { id: lead_id },
      select: { id: true, deleted_at: true },
    });
    if (!lead || lead.deleted_at)
      throw new HTTPException(404, { message: "Lead not found" });

    let sellerId: string | null = null;
    if (authUser.role === "SALES_REP") {
      const own = await prisma.sellerProfile.findUnique({
        where: { user_id: authUser.userId },
        select: { id: true },
      });
      if (!own)
        throw new HTTPException(404, {
          message: "Seller profile not found for current user",
        });
      sellerId = own.id;
    } else if (requestedSellerId) {
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: requestedSellerId },
        select: { id: true },
      });
      if (!seller)
        throw new HTTPException(404, { message: "Seller not found" });
      sellerId = seller.id;
    }

    const { resolvedItems, codesUsed, subTotal, discount, totalAmount } =
      await priceOrderItems(prisma, order_items);
    const orderCode = await generateUniqueOrderCode(prisma);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          lead_id,
          created_by: authUser.userId,
          seller_id: sellerId,
          sub_total: subTotal,
          total_amount: totalAmount,
          discount,
          order_status: "PENDING",
          order_code: orderCode,
          orderDetails: { createMany: { data: resolvedItems } },
        },
        include: orderInclude,
      });

      // Increment usage inside the same transaction so two concurrent orders
      // can't both slip past a max_uses check.
      for (const code of codesUsed) {
        await tx.discountCode.update({
          where: { code },
          data: { times_used: { increment: 1 } },
        });
      }

      return created;
    });

    return c.json(
      { success: true, message: "Order created successfully", data: order },
      201,
    );
  })
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
