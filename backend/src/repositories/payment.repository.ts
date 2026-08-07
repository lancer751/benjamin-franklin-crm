import type { Prisma, PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type { CreatePaymentInput, PaymentQuery, UpdatePaymentStatusInput } from "shared";
import { assertEvidenceExists } from "@/lib/storage";

type Tx = Prisma.TransactionClient;
type PaymentDb = Pick<PrismaClient, "scheduledPayment" | "payment" | "orderDetail">;

const paymentInclude = {
    order: {
        select: {
            id: true,
            order_code: true,
            member_id: true,
            assigned_to: true,
            total_amount: true,
            member: {
                select: {
                    id: true,
                    campaing_id: true,
                    lead: { select: { id: true, first_name: true, last_name: true, email: true, dni: true } },
                },
            },
        },
    },
    schedulePayment: {
        select: {
            id: true,
            due_date: true,
            due_amount: true,
            number: true,
            status: true,
            payment_plan_id: true,
            payment_plan: {
                select: {
                    orderDetail: {
                        select: { id: true, product: { select: { id: true, name: true, enrollment_fee: true } } },
                    },
                },
            },
        },
    },
    orderDetail: { select: { id: true, product: { select: { id: true, name: true, enrollment_fee: true } } } },
    creator: { select: { id: true, first_name: true, last_name: true } },
    reviewer: { select: { id: true, first_name: true, last_name: true } },
} as const;

async function resolveTarget(prisma: PaymentDb, orderId: string, target: CreatePaymentInput["target"]) {
    if (target.type === "SCHEDULED_INSTALLMENT") {
        const sp = await prisma.scheduledPayment.findUnique({
            where: { id: target.scheduled_payment_id },
            include: { payment_plan: { include: { orderDetail: true } } },
        });
        if (!sp) throw new HTTPException(404, { message: "Cuota programada no encontrada" });
        if (sp.status === "PAID") throw new HTTPException(409, { message: "Esta cuota ya fue pagada" });
        if (sp.payment_plan.orderDetail.order_id !== orderId) {
            throw new HTTPException(400, { message: "La cuota no pertenece a esta orden" });
        }
        const existing = await prisma.payment.findFirst({
            where: {
                scheduled_payment_id: sp.id,
                payment_status: { in: ["PENDING", "CONFIRMED"] },
            },
            select: { id: true },
        });
        if (existing) {
            throw new HTTPException(409, {
                message: "Esta cuota ya tiene un pago registrado o pendiente de validación",
            });
        }
        return { scheduled_payment_id: sp.id, order_detail_id: null as string | null, expectedAmount: Number(sp.due_amount) };
    }

    const detail = await prisma.orderDetail.findUnique({
        where: { id: target.order_detail_id },
        include: { product: { include: { edition: true } } },
    });
    if (!detail || detail.order_id !== orderId) throw new HTTPException(404, { message: "Ítem de orden no encontrado" });
    if (detail.product.edition.modality !== "ASINCRONICO") {
        throw new HTTPException(400, { message: "FULL_CASH solo aplica a productos ASINCRONICO — usa una cuota programada" });
    }
    const existing = await prisma.payment.findFirst({
        where: { order_detail_id: detail.id, payment_status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (existing) throw new HTTPException(409, { message: "Este ítem ya tiene un pago registrado" });

    return { scheduled_payment_id: null as string | null, order_detail_id: detail.id, expectedAmount: Number(detail.price) };
}

async function maybeCompleteOrder(tx: Tx, orderId: string) {
    const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { payments: { where: { payment_status: "CONFIRMED" } } },
    });
    const confirmedTotal = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (confirmedTotal >= Number(order.total_amount) && order.order_status !== "COMPLETED") {
        await tx.order.update({ where: { id: orderId }, data: { order_status: "COMPLETED" } });
    }
}

async function ensureCustomerProfile(tx: Tx, orderId: string) {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { member: { select: { lead_id: true } } } });
    const leadId = order.member.lead_id;
    if (await tx.customerProfile.findUnique({ where: { lead_id: leadId } })) return;

    const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId }, select: { first_name: true, last_name: true } });
    const base = `${lead.first_name ?? ""}${lead.last_name ?? ""}`.toLowerCase().replace(/[^a-z0-9]/g, "") || `client${Date.now()}`;
    const tempPassword = crypto.randomUUID().slice(0, 12);

    await tx.customerProfile.create({
        data: { lead_id: leadId, moodle_user_name: base, password: await Bun.password.hash(tempPassword) },
    });
}

export function paymentRepository(prisma: PrismaClient) {
    return {
        async findMany({ page, limit, order_id, payment_status }: PaymentQuery) {
            const skip = (page - 1) * limit;
            const where = { ...(order_id && { order_id }), ...(payment_status && { payment_status }) };
            const [payments, total] = await Promise.all([
                prisma.payment.findMany({ where, skip, take: limit, orderBy: { created_at: "desc" }, include: paymentInclude }),
                prisma.payment.count({ where }),
            ]);
            return { payments, total, page, limit };
        },

        async findById(id: string) {
            const payment = await prisma.payment.findUnique({ where: { id }, include: paymentInclude });
            if (!payment) throw new HTTPException(404, { message: "Payment not found" });
            return payment;
        },

        async create(authUser: { userId: string; role: string }, data: CreatePaymentInput) {
            await assertEvidenceExists(data.payment_receipt);

            return prisma.$transaction(async (tx) => {
                const targetId = data.target.type === "SCHEDULED_INSTALLMENT"
                    ? data.target.scheduled_payment_id
                    : data.target.order_detail_id;
                const lockKey = `payment-target:${targetId}`;
                await tx.$queryRaw<Array<{ pg_advisory_xact_lock: unknown }>>
                    `SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

                const order = await tx.order.findUnique({
                    where: { id: data.order_id },
                    select: { id: true, order_status: true, assigned_to: true },
                });
                if (!order) throw new HTTPException(404, { message: "Order not found" });
                if (authUser.role === "SALES_REP" && order.assigned_to !== authUser.userId) {
                    throw new HTTPException(403, { message: "No tienes acceso a esta orden" });
                }
                if (order.order_status === "CANCELLED" || order.order_status === "REFUNDED") {
                    throw new HTTPException(400, { message: `No se pueden registrar pagos en una orden ${order.order_status}` });
                }

                const resolved = await resolveTarget(tx, data.order_id, data.target);
                if (Number(data.amount) !== resolved.expectedAmount) {
                    throw new HTTPException(400, { message: `El monto debe ser ${resolved.expectedAmount.toFixed(2)}` });
                }

                return tx.payment.create({
                    data: {
                        order_id: data.order_id,
                        created_by: authUser.userId,
                        payment_date: data.payment_date,
                        amount: data.amount,
                        payment_method: data.payment_method,
                        payment_status: "PENDING",
                        type: data.target.type === "SCHEDULED_INSTALLMENT" ? "INSTALLMENTS" : "FULL",
                        currency: data.currency,
                        transaccion_id: data.transaccion_id,
                        payment_receipt: data.payment_receipt,
                        scheduled_payment_id: resolved.scheduled_payment_id,
                        order_detail_id: resolved.order_detail_id,
                    },
                    include: paymentInclude,
                });
            });
        },

        async cancel(id: string, authUser: { userId: string; role: string }) {
            const payment = await prisma.payment.findUnique({
                where: { id },
                select: { id: true, payment_status: true, order: { select: { assigned_to: true } } },
            });
            if (!payment) throw new HTTPException(404, { message: "Payment not found" });
            if (authUser.role === "SALES_REP" && payment.order.assigned_to !== authUser.userId) {
                throw new HTTPException(403, { message: "No tienes acceso a este pago" });
            }
            if (payment.payment_status !== "PENDING") {
                throw new HTTPException(400, { message: "Solo se pueden eliminar pagos PENDING" });
            }
            await prisma.payment.delete({ where: { id } });
        },

        async updateStatus(id: string, reviewerId: string, data: UpdatePaymentStatusInput) {
            const payment = await prisma.payment.findUnique({
                where: { id },
                select: { id: true, payment_status: true, order_id: true, scheduled_payment_id: true },
            });
            if (!payment) throw new HTTPException(404, { message: "Payment not found" });
            if (payment.payment_status !== "PENDING") {
                throw new HTTPException(409, {
                    message: `No se puede cambiar un pago ${payment.payment_status} a ${data.payment_status}`,
                });
            }

            return prisma.$transaction(async (tx) => {
                const updated = await tx.payment.update({
                    where: { id },
                    data: { payment_status: data.payment_status, reviewed_by: reviewerId },
                    include: paymentInclude,
                });

                if (data.payment_status === "CONFIRMED") {
                    if (payment.scheduled_payment_id) {
                        await tx.scheduledPayment.update({ where: { id: payment.scheduled_payment_id }, data: { status: "PAID" } });
                        const sp = await tx.scheduledPayment.findUniqueOrThrow({
                            where: { id: payment.scheduled_payment_id },
                            select: { payment_plan_id: true },
                        });
                        const remaining = await tx.scheduledPayment.count({
                            where: { payment_plan_id: sp.payment_plan_id, status: { not: "PAID" } },
                        });
                        if (remaining === 0) {
                            await tx.paymentPlan.update({ where: { id: sp.payment_plan_id }, data: { status: "COMPLETED" } });
                        }
                    }

                    await maybeCompleteOrder(tx, payment.order_id);
                    await ensureCustomerProfile(tx, payment.order_id); // ← lead → cliente
                }

                return updated;
            });
        },
    };
}
