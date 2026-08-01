import { type DiscountCode, type PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type {
  OrderDetail as OrderDetailBody,
  OrderItemsBodyCreation,
} from "shared";
import { discountCodeRoutes } from "@/routes/products/discount-codes/discounts.routes";
import { faker } from "@faker-js/faker";

const acceptableDiscountCode = (
  code: DiscountCode | null,
  productId: string,
) => {
  const currentDate = new Date();

  if (!code || !code.is_active) {
    throw new HTTPException(422, {
      message: `code ${code?.code} is invalid or is inactive`,
    });
  }

  const conditions = {
    isNotActive: !code || !code.is_active,
    notOwnsToProduct: code.product_id !== productId,
    hasExpired: code.valid_until && currentDate > code.valid_until,
    hasNotBeenActivated: code.valid_from && currentDate < code.valid_from,
    isOverused: code.max_uses !== null && code.max_uses > code.times_used,
  };

  //   if (code.product_id !== productId) {
  //     throw new HTTPException(422, {
  //       message: `code ${codeStr} doesn't apply to this product`,
  //     });
  //   }

  //   if (code.valid_until && currentDate > code.valid_until) {
  //     throw new HTTPException(422, { message: "Code has expired" });
  //   }

  //   if (code.valid_from && currentDate < code.valid_from) {
  //     throw new HTTPException(422, {
  //       message: "Code can't be used before the scheduled date",
  //     });
  //   }

  //   if (code.max_uses !== null && code.max_uses > code.times_used) {
  //     throw new HTTPException(422, {
  //       message: `Code ${code} has reached its use limit`,
  //     });
  //   }

  if (!Object.values(conditions).every((condition) => condition === false)) {
    throw new HTTPException(422, {
      message: `Discount code doesn't accomplish the conditions ${conditions}`,
    });
  }
};

async function resolveDiscount(
  prisma: PrismaClient,
  codeStr: string,
  productId: string,
  basePrice: number,
  maxDeductible: number, // basePrice - enrollment fee, it represent the price where the discount will be applied to avoid counting the enrollment fee amount
): Promise<{ codeId: string; amount: number }> {
  const code = await prisma.discountCode.findUniqueOrThrow({
    where: {
      code: codeStr,
      product_id: productId,
    },
  });

  acceptableDiscountCode(code, productId);
  // check this discount assignment
  const discountAmountRaw =
    code.type === "PERCENTAGE"
      ? basePrice * (Number(code.value) / 100)
      : Number(code.value);

  // if (discountAmountRaw > maxDeductible) {
  //   throw new HTTPException(500, {
  //     message:
  //       "the discount amount can't be greater than the product deductible price",
  //   });
  // }

  return {
    codeId: code.id,
    amount: Math.min(discountAmountRaw, maxDeductible),
  };
}

export async function orderItemsRecordData(
  prisma: PrismaClient,
  items: OrderDetailBody[],
) {
  const selectedProducts = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((i) => i.product_id),
      },
    },
    select: {
      id: true,
      edition: {
        select: {
          modality: true,
        },
      },
      enrollment_fee: true,
      prices: {
        select: {
          attendance_mode: true,
          cash_price: true,
          installment_price: true,
        },
      },
    },
  });

  const codesUsed: string[] = [];
  const finalOrderItemsRaw: OrderItemsBodyCreation[] = [];
  let discountTotal = 0;
  let subtotal = 0;

  for (const item of items) {
    const relatedProduct = selectedProducts.find(
      (pr) => pr.id === item.product_id,
    );

    if (!relatedProduct) {
      throw new HTTPException(422, {
        message: "Producto no encontrado en la orden",
      });
    }

    const isHibridEdition = relatedProduct.edition.modality === "HIBRIDO";
    const isAsynchronousEditon =
      relatedProduct.edition.modality === "ASINCRONICO";
    const isCommonEdition =
      relatedProduct.edition.modality === "PRESENCIAL" ||
      relatedProduct.edition.modality === "VIRTUAL";
    const expectedPrice = relatedProduct.prices.find(
      (p) => p.attendance_mode === item.attendance_mode,
    );

    if (isHibridEdition && item.attendance_mode === "HEREDADO") {
      throw new HTTPException(422, {
        message: "Modo de asistencia no valido para esta modalidad",
      });
    }
    if (isAsynchronousEditon && item.attendance_mode !== "HEREDADO") {
      throw new HTTPException(422, {
        message: "Modo de asistencia no valido para esta modalidad",
      });
    }
    if (isCommonEdition && item.attendance_mode !== "HEREDADO") {
      throw new HTTPException(422, {
        message: "Modo de asistencia no valido para esta modalidad",
      });
    }

    if (
      (isAsynchronousEditon || expectedPrice?.installment_price === null) &&
      item.payment_modality === "INSTALLMENTS"
    ) {
      throw new HTTPException(422, {
        message:
          "Este product solo permite pagos al contado (edicion asincrona)",
      });
    }

    const baseAmount =
      item.payment_modality === "FULL"
        ? Number(expectedPrice?.cash_price)
        : Number(expectedPrice?.installment_price);

    if (isAsynchronousEditon && relatedProduct.enrollment_fee) {
      throw new HTTPException(422, {
        message: "La modalidad asincrona no cuenta con precio de inscripcion",
      });
    }

    const enrollmentFee = relatedProduct.enrollment_fee
      ? Number(relatedProduct.enrollment_fee)
      : 0;
    let discountAmount = 0;

    if (item.discount_code) {
      const discountAmountDetail = await resolveDiscount(
        prisma,
        item.discount_code,
        item.product_id,
        baseAmount,
        baseAmount - enrollmentFee,
      );
      discountAmount = Number(discountAmountDetail.amount);
      codesUsed.push(discountAmountDetail.codeId);
    }

    discountTotal += discountAmount;
    subtotal += baseAmount;
    const price = baseAmount - discountAmount;

    finalOrderItemsRaw.push({
      product_id: item.product_id,
      attendance_mode: item.attendance_mode,
      payment_modality: item.payment_modality,
      base_price: baseAmount.toFixed(2),
      discount_code_id: item.discount_code ?? null,
      discount_amount: discountAmount.toFixed(2),
      price: price.toFixed(2),
    });
  }

  return {
    resolvedItems: finalOrderItemsRaw,
    codesUsed,
    subtotal,
    discountTotal,
    totalAmount: (subtotal - discountTotal).toFixed(2),
  };
}

export async function generateUniqueOrderCode(prisma: PrismaClient) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = faker.string.alpha({ length: 7, casing: "upper" });

    const existingCode = await prisma.order.findUnique({
      where: { order_code: code },
    });

    if (!existingCode) {
      return code;
    }
  }

  throw new HTTPException(500, {
    message: "Could not generate a unique order code, please retry",
  });
}
