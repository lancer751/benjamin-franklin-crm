import { faker } from "@faker-js/faker";
import type { PrismaClient } from "../../../generated/prisma/client";
import type { SeedMember, SeedOrder, SeedProducts } from "../context";

const SCENARIOS = [
  {
    productKey: "hibridoProductId" as const,
    attendance_mode: "VIRTUAL" as const,
    payment_modality: "INSTALLMENTS" as const,
    price: 380,
    kind: "HIBRIDO" as const,
  },
  {
    productKey: "asincronicoProductId" as const,
    attendance_mode: "HEREDADO" as const,
    payment_modality: "FULL" as const,
    price: 890,
    kind: "ASINCRONICO" as const,
  },
];

export async function seedOrders(
  prisma: PrismaClient,
  members: SeedMember[],
  adminId: string,
  products: SeedProducts,
): Promise<SeedOrder[]> {
  const matriculados = members.filter((m) => m.status === "MATRICULADO");
  const orders: SeedOrder[] = [];

  for (let i = 0; i < matriculados.length; i++) {
    const member = matriculados[i]!;
    const scenario = SCENARIOS[i % SCENARIOS.length]!;

    // No hay una unique key natural para un "order de prueba por miembro",
    // así que usamos find-then-create en vez de upsert para mantener la
    // idempotencia entre corridas.
    let order = await prisma.order.findFirst({
      where: { member_id: member.id },
      include: { orderDetails: true },
    });
    if (!order) {
      order = await prisma.order.create({
        data: {
          order_code: faker.string.alpha({ length: 7, casing: "upper" }),
          member_id: member.id,
          generated_by: adminId,
          assigned_to: member.assignedTo,
          sub_total: scenario.price.toFixed(2),
          total_amount: scenario.price.toFixed(2),
          discount: "0.00",
          orderDetails: {
            create: {
              product_id: products[scenario.productKey],
              attendance_mode: scenario.attendance_mode,
              payment_modality: scenario.payment_modality,
              base_price: scenario.price.toFixed(2),
              discount_amount: "0.00",
              price: scenario.price.toFixed(2),
            },
          },
        },
        include: { orderDetails: true },
      });
    }

    orders.push({
      id: order.id,
      detailId: order.orderDetails[0]!.id,
      modality: scenario.kind,
    });
  }

  console.log(`  ✓ ${orders.length} órdenes`);
  return orders;
}
