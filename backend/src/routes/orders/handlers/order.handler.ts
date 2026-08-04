import { type DiscountCode, type PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type { OrderDetail as OrderDetailBody, OrderItemsBodyCreation } from "shared";
import { faker } from "@faker-js/faker";

function assertDiscountCodeUsable(
  code: DiscountCode | null,
  productId: string,
): asserts code is DiscountCode {
  if (!code || !code.is_active) {
    throw new HTTPException(422, { message: "El código de descuento no es válido o está inactivo" });
  }
  if (code.product_id !== null && code.product_id !== productId) {
    throw new HTTPException(422, { message: `El código "${code.code}" no aplica a este producto` });
  }
  const now = new Date();
  if (code.valid_from && now < code.valid_from) {
    throw new HTTPException(422, { message: `El código "${code.code}" aún no está activo` });
  }
  if (code.valid_until && now > code.valid_until) {
    throw new HTTPException(422, { message: `El código "${code.code}" ha expirado` });
  }
  if (code.max_uses !== null && code.times_used >= code.max_uses) {
    throw new HTTPException(422, { message: `El código "${code.code}" alcanzó su límite de usos` });
  }
}

async function resolveDiscount(
  prisma: PrismaClient,
  codeStr: string,
  productId: string,
  basePrice: number,
  maxDeductible: number, // basePrice - enrollment fee — discount can't eat into the enrollment portion
): Promise<{ codeId: string; amount: number }> {
  const code = await prisma.discountCode.findUnique({ where: { code: codeStr } });
  assertDiscountCodeUsable(code, productId);

  const raw = code.type === "PERCENTAGE" ? basePrice * (Number(code.value) / 100) : Number(code.value);
  return { codeId: code.id, amount: Math.min(raw, maxDeductible) };
}

export async function orderItemsRecordData(prisma: PrismaClient, items: OrderDetailBody[]) {
  const selectedProducts = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.product_id) } },
    select: {
      id: true,
      enrollment_fee: true,
      edition: { select: { modality: true } },
      prices: { select: { attendance_mode: true, cash_price: true, installment_price: true } },
    },
  });

  const codesUsed: string[] = []; // DiscountCode.id values
  const resolvedItems: OrderItemsBodyCreation[] = [];
  let discountTotal = 0;
  let subtotal = 0;

  for (const item of items) {
    const product = selectedProducts.find((p) => p.id === item.product_id);
    if (!product) throw new HTTPException(422, { message: "Producto no encontrado en la orden" });

    const isHibrido = product.edition.modality === "HIBRIDO";
    const isAsincronico = product.edition.modality === "ASINCRONICO";

    // Non-HIBRIDO editions always price off the HEREDADO row; HIBRIDO always
    // needs an explicit VIRTUAL/PRESENCIAL choice. Collapsed from three
    // branches since ASINCRONICO/PRESENCIAL/VIRTUAL all require the same thing.
    if (isHibrido === (item.attendance_mode === "HEREDADO")) {
      throw new HTTPException(422, { message: "Modo de asistencia no válido para esta modalidad" });
    }

    const expectedPrice = product.prices.find((p) => p.attendance_mode === item.attendance_mode);
    if (!expectedPrice) {
      throw new HTTPException(422, {
        message: `No hay un precio configurado para el producto ${item.product_id} en modo ${item.attendance_mode}`,
      });
    }

    if (item.payment_modality === "INSTALLMENTS" && (isAsincronico || expectedPrice.installment_price === null)) {
      throw new HTTPException(422, { message: "Este producto solo permite pagos al contado (edición asíncrona)" });
    }
    if (isAsincronico && product.enrollment_fee) {
      throw new HTTPException(422, { message: "La modalidad asíncrona no cuenta con precio de inscripción" });
    }

    const baseAmount = Number(item.payment_modality === "FULL" ? expectedPrice.cash_price : expectedPrice.installment_price);
    const enrollmentFee = isAsincronico || !product.enrollment_fee ? 0 : Number(product.enrollment_fee);

    let discountCodeId: string | null = null;
    let discountAmount = 0;
    if (item.discount_code) {
      const resolved = await resolveDiscount(prisma, item.discount_code, item.product_id, baseAmount, baseAmount - enrollmentFee);
      discountCodeId = resolved.codeId; // ← was the raw code string before
      discountAmount = resolved.amount;
      codesUsed.push(resolved.codeId); // ← matches the id-based update below now
    }

    discountTotal += discountAmount;
    subtotal += baseAmount;

    resolvedItems.push({
      product_id: item.product_id,
      attendance_mode: item.attendance_mode,
      payment_modality: item.payment_modality,
      base_price: baseAmount.toFixed(2),
      discount_code_id: discountCodeId,
      discount_amount: discountAmount.toFixed(2),
      price: (baseAmount - discountAmount).toFixed(2),
    });
  }

  return { resolvedItems, codesUsed, subtotal, discountTotal, totalAmount: (subtotal - discountTotal).toFixed(2) };
}

export async function generateUniqueOrderCode(prisma: PrismaClient) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = faker.string.alpha({ length: 7, casing: "upper" });
    const existing = await prisma.order.findUnique({ where: { order_code: code } });
    if (!existing) return code;
  }
  throw new HTTPException(500, { message: "Could not generate a unique order code, please retry" });
}

// Used by PUT /orders/:id when order_items changes — re-prices from scratch
// and blocks the change once any item already has a payment schedule, so a
// repricing can never silently orphan a PaymentPlan/ScheduledPayment chain.
export async function updateOrderItems(prisma: PrismaClient, orderId: string, items: OrderDetailBody[]) {
  const existingDetails = await prisma.orderDetail.findMany({
    where: { order_id: orderId },
    select: { id: true, paymentPlan: { select: { id: true } } },
  });
  if (existingDetails.length === 0) throw new HTTPException(404, { message: "Order not found" });
  if (existingDetails.some((d) => d.paymentPlan)) {
    throw new HTTPException(409, {
      message: "No se pueden modificar los productos de una orden que ya tiene un cronograma de pagos",
    });
  }

  const { codesUsed, discountTotal, subtotal, totalAmount, resolvedItems } = await orderItemsRecordData(prisma, items);

  return prisma.$transaction(async (tx) => {
    await tx.orderDetail.deleteMany({ where: { order_id: orderId } });
    await tx.orderDetail.createMany({ data: resolvedItems.map((item) => ({ ...item, order_id: orderId })) });

    for (const discountCodeId of codesUsed) {
      await tx.discountCode.update({ where: { id: discountCodeId }, data: { times_used: { increment: 1 } } });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { sub_total: subtotal, total_amount: totalAmount, discount: discountTotal },
      include: { orderDetails: true },
    });
  });
}