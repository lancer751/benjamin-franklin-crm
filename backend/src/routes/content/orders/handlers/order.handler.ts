import type { DiscountCode, PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type { OrderDetail } from "shared";

const acceptableDiscountCode = (
  code: DiscountCode | null,
  codeStr: string,
  productId: string,
) => {
  const currentDate = new Date();

  if (!code || !code.is_active) {
    throw new HTTPException(422, {
      message: `code ${codeStr} is invalid or is inactive`,
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
): Promise<{ id: string; amount: number }> {
  const code = await prisma.discountCode.findUniqueOrThrow({
    where: {
      code: codeStr,
      product_id: productId,
    },
  });

  acceptableDiscountCode(code, codeStr, productId);
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

  return { id: code.id, amount: Math.min(discountAmountRaw, maxDeductible) };
}


async function orderItemsRecordData (prisma: PrismaClient, items: OrderDetail[]) {

  const selectedProducts = await prisma.product.findMany({
    where:{
      id: {
        in: items.map(i => i.product_id)
      }
    },
    select: {
      edition: {
        select: {
          modality: true,
        }
      },
      enrollment_fee: true,
      prices: true
    }
  })

  const finalOrderItemsRaw : OrderDetail[] = []
  const discountCodes: string[] = []
}