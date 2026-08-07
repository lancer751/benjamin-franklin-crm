import type { PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type { CreatePaymentScheduleInput } from "shared";

// Validates the raw installments array against the item's actual numbers
// and splits it into "the enrollment fee entry" (if any) + "the rest".
// Doesn't touch the DB — pure validation, easy to unit test on its own.
function buildScheduleEntries(
    detailPrice: number,
    enrollmentFee: number,
    paymentModality: "FULL" | "INSTALLMENTS",
    installmentsRange: { min: number; max: number },
    input: CreatePaymentScheduleInput,
) {
    const entries = input.installments;
    const remainingBalance = detailPrice - enrollmentFee;

    let restEntries = entries;
    if (enrollmentFee > 0) {
        if (entries.length < 2) {
            throw new HTTPException(400, {
                message: `El primer pago programado debe cubrir la cuota de inscripción (${enrollmentFee.toFixed(2)})`,
            });
        }
        const feeEntry = entries[0]!;
        if (Number(feeEntry.due_amount).toFixed(2) !== enrollmentFee.toFixed(2)) {
            throw new HTTPException(400, {
                message: `El primer pago programado debe ser exactamente ${enrollmentFee.toFixed(2)} (cuota de inscripción)`,
            });
        }
        restEntries = entries.slice(1);
    }

    if (paymentModality === "FULL" && restEntries.length !== 1) {
        throw new HTTPException(400, {
            message: "Los productos al contado solo admiten un pago programado para el saldo restante",
        });
    }
    if (paymentModality === "INSTALLMENTS") {
        if (restEntries.length < installmentsRange.min || restEntries.length > installmentsRange.max) {
            throw new HTTPException(400, {
                message: `Este producto admite entre ${installmentsRange.min} y ${installmentsRange.max} cuotas después de la inscripción`,
            });
        }
    }

    const restSum = restEntries.reduce((sum, e) => sum + Number(e.due_amount), 0);
    if (restSum.toFixed(2) !== remainingBalance.toFixed(2)) {
        throw new HTTPException(400, {
            message: `Las cuotas restantes (${restSum.toFixed(2)}) deben sumar el saldo pendiente (${remainingBalance.toFixed(2)})`,
        });
    }

    return entries;
}

async function loadDetailForScheduling(prisma: PrismaClient, orderId: string, detailId: string) {
    const detail = await prisma.orderDetail.findFirst({
        where: { id: detailId, order_id: orderId },
        include: {
            product: { include: { edition: true } },
            paymentPlan: { include: { installments: true } },
        },
    });
    if (!detail) throw new HTTPException(404, { message: "Order item not found on this order" });
    if (detail.product.edition.modality === "ASINCRONICO") {
        throw new HTTPException(400, {
            message: "ASINCRONICO items don't use a payment schedule — register a full payment directly",
        });
    }
    return detail;
}

export function paymentPlanRepository(prisma: PrismaClient) {
    return {
        async findByDetail(orderId: string, detailId: string) {
            const detail = await prisma.orderDetail.findFirst({
                where: { id: detailId, order_id: orderId },
                select: { paymentPlan: { include: { installments: { orderBy: { number: "asc" } } } } },
            });
            if (!detail) throw new HTTPException(404, { message: "Order item not found on this order" });
            if (!detail.paymentPlan) throw new HTTPException(404, { message: "This item has no payment schedule yet" });
            return detail.paymentPlan;
        },

        async create(orderId: string, detailId: string, input: CreatePaymentScheduleInput) {
            const detail = await loadDetailForScheduling(prisma, orderId, detailId);
            if (detail.paymentPlan) throw new HTTPException(409, { message: "This item already has a payment schedule" });

            const enrollmentFee = Number(detail.product.enrollment_fee ?? 0);
            const entries = buildScheduleEntries(
                Number(detail.price),
                enrollmentFee,
                detail.payment_modality,
                { min: detail.product.installments_min_number, max: detail.product.installments_max_number },
                input,
            );

            return prisma.$transaction(async (tx) => {
                const plan = await tx.paymentPlan.create({
                    data: {
                        order_detail_id: detailId,
                        total_installments: entries.length,
                        total_amount: detail.price,
                        start_date: input.start_date,
                        status: "PENDING",
                    },
                });
                await tx.scheduledPayment.createMany({
                    data: entries.map((e, idx) => ({
                        due_date: e.due_date,
                        due_amount: e.due_amount,
                        payment_plan_id: plan.id,
                        number: idx + 1,
                        status: "PENDING",
                    })),
                });
                return tx.paymentPlan.findUniqueOrThrow({
                    where: { id: plan.id },
                    include: { installments: { orderBy: { number: "asc" } } },
                });
            });
        },

        async replace(orderId: string, detailId: string, input: CreatePaymentScheduleInput) {
            const detail = await loadDetailForScheduling(prisma, orderId, detailId);
            if (!detail.paymentPlan) throw new HTTPException(404, { message: "This item has no payment schedule yet" });
            if (detail.paymentPlan.installments.some((i) => i.status !== "PENDING")) {
                throw new HTTPException(409, { message: "No se puede modificar un cronograma que ya tiene pagos registrados" });
            }

            const enrollmentFee = Number(detail.product.enrollment_fee ?? 0);
            const entries = buildScheduleEntries(
                Number(detail.price),
                enrollmentFee,
                detail.payment_modality,
                { min: detail.product.installments_min_number, max: detail.product.installments_max_number },
                input,
            );
            const planId = detail.paymentPlan.id;

            return prisma.$transaction(async (tx) => {
                await tx.scheduledPayment.deleteMany({ where: { payment_plan_id: planId } });
                await tx.scheduledPayment.createMany({
                    data: entries.map((e, idx) => ({
                        due_date: e.due_date,
                        due_amount: e.due_amount,
                        payment_plan_id: planId,
                        number: idx + 1,
                        status: "PENDING",
                    })),
                });
                return tx.paymentPlan.update({
                    where: { id: planId },
                    data: { total_installments: entries.length, start_date: input.start_date },
                    include: { installments: { orderBy: { number: "asc" } } },
                });
            });
        },

        async cancel(orderId: string, detailId: string) {
            const detail = await prisma.orderDetail.findFirst({
                where: { id: detailId, order_id: orderId },
                include: { paymentPlan: { include: { installments: true } } },
            });
            if (!detail) throw new HTTPException(404, { message: "Order item not found on this order" });
            if (!detail.paymentPlan) throw new HTTPException(404, { message: "This item has no payment schedule" });
            if (detail.paymentPlan.installments.some((i) => i.status !== "PENDING")) {
                throw new HTTPException(409, { message: "No se puede eliminar un cronograma con pagos ya registrados" });
            }

            await prisma.$transaction(async (tx) => {
                await tx.scheduledPayment.deleteMany({ where: { payment_plan_id: detail.paymentPlan!.id } });
                await tx.paymentPlan.delete({ where: { id: detail.paymentPlan!.id } });
            });
        },
    };
}