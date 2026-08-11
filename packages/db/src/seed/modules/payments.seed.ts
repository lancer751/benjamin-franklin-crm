import type { PrismaClient } from "../../../generated/prisma/client";
import type { SeedOrder } from "../context";

export async function seedPayments(
  prisma: PrismaClient,
  orders: SeedOrder[],
  reviewerId: string,
) {
  for (const order of orders) {
    if (order.modality === "ASINCRONICO") {
      const existing = await prisma.payment.findFirst({
        where: { order_detail_id: order.detailId },
      });
      if (!existing) {
        await prisma.payment.create({
          data: {
            order_id: order.id,
            order_detail_id: order.detailId,
            created_by: reviewerId,
            reviewed_by: reviewerId,
            payment_date: new Date(),
            amount: "890.00",
            payment_method: "BANK_TRANSFER",
            payment_status: "CONFIRMED",
            type: "FULL",
            payment_receipt: "seed/placeholder-receipt.pdf",
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: { order_status: "COMPLETED" },
        });
      }
      continue;
    }

    // HIBRIDO / INSTALLMENTS — cuota de inscripción (100) pagada ahora, dos
    // cuotas (140 + 140) quedan PENDING a propósito para probar la
    // confirmación manual vía Postman.
    let plan = await prisma.paymentPlan.findUnique({
      where: { order_detail_id: order.detailId },
      include: { installments: true },
    });
    if (!plan) {
      plan = await prisma.paymentPlan.create({
        data: {
          order_detail_id: order.detailId,
          total_installments: 3,
          total_amount: "380.00",
          start_date: new Date(),
          installments: {
            create: [
              {
                due_date: new Date(),
                due_amount: "100.00",
                number: 1,
                status: "PENDING",
              },
              {
                due_date: new Date(Date.now() + 30 * 86400000),
                due_amount: "140.00",
                number: 2,
                status: "PENDING",
              },
              {
                due_date: new Date(Date.now() + 60 * 86400000),
                due_amount: "140.00",
                number: 3,
                status: "PENDING",
              },
            ],
          },
        },
        include: { installments: true },
      });
    }

    const feeInstallment = plan.installments.find((i) => i.number === 1)!;
    const existingPayment = await prisma.payment.findFirst({
      where: { scheduled_payment_id: feeInstallment.id },
    });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          order_id: order.id,
          scheduled_payment_id: feeInstallment.id,
          created_by: reviewerId,
          reviewed_by: reviewerId,
          payment_date: new Date(),
          amount: "100.00",
          payment_method: "YAPE",
          payment_status: "CONFIRMED",
          type: "INSTALLMENTS",
          payment_receipt: "seed/placeholder-receipt.jpg",
        },
      });
      await prisma.scheduledPayment.update({
        where: { id: feeInstallment.id },
        data: { status: "PAID" },
      });
    }
  }

  console.log(`  ✓ planes de pago + comprobantes de prueba`);
}
