import type { PrismaClient } from "../../../generated/prisma/client";
import type { SeedAcademic, SeedProducts } from "../context";

export async function seedProducts(prisma: PrismaClient, editions: SeedAcademic, adminId: string): Promise<SeedProducts> {
  const category = await prisma.category.upsert({ where: { name: "Tecnología" }, update: {}, create: { name: "Tecnología" } });

  const hibridoProduct = await prisma.product.upsert({
    where: { edition_id: editions.hibridoEditionId },
    update: {},
    create: {
      name: "Full Stack Bootcamp — Edición Híbrida", edition_id: editions.hibridoEditionId, category_id: category.id,
      installments_min_number: 1, installments_max_number: 3, sales_status: "PUBLISHED", enrollment_fee: "100.00",
    },
  });
  await prisma.productPrice.upsert({
    where: { product_id_attendance_mode: { product_id: hibridoProduct.id, attendance_mode: "VIRTUAL" } },
    update: {}, create: { product_id: hibridoProduct.id, attendance_mode: "VIRTUAL", cash_price: "350.00", installment_price: "380.00" },
  });
  await prisma.productPrice.upsert({
    where: { product_id_attendance_mode: { product_id: hibridoProduct.id, attendance_mode: "PRESENCIAL" } },
    update: {}, create: { product_id: hibridoProduct.id, attendance_mode: "PRESENCIAL", cash_price: "450.00", installment_price: "480.00" },
  });

  const asincronicoProduct = await prisma.product.upsert({
    where: { edition_id: editions.asincronicoEditionId },
    update: {},
    create: {
      name: "Full Stack Bootcamp — Edición Asíncrona", edition_id: editions.asincronicoEditionId, category_id: category.id,
      installments_min_number: 1, installments_max_number: 1, sales_status: "PUBLISHED", enrollment_fee: null,
    },
  });
  await prisma.productPrice.upsert({
    where: { product_id_attendance_mode: { product_id: asincronicoProduct.id, attendance_mode: "HEREDADO" } },
    update: {}, create: { product_id: asincronicoProduct.id, attendance_mode: "HEREDADO", cash_price: "890.00", installment_price: null },
  });

  const discountCode = await prisma.discountCode.upsert({
    where: { code: "PROMO25" }, update: {},
    create: { code: "PROMO25", type: "PERCENTAGE", value: "10", created_by: adminId },
  });

  console.log(`  ✓ 1 categoría, 2 productos, 3 precios, 1 código de descuento`);
  return { hibridoProductId: hibridoProduct.id, asincronicoProductId: asincronicoProduct.id, discountCode: discountCode.code };
}