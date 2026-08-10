import type { PaymentInclude, PaymentWhereInput, Prisma, PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type { CreatePaymentInput, PaymentQuery, UpdatePaymentStatusInput } from "shared";
import { assertEvidenceExists } from "@/lib/storage";

type Tx = Prisma.TransactionClient;

const paymentInclude: PaymentInclude = {
    order: { select: { id: true, order_code: true, member_id: true, assigned_to: true } },
    schedulePayment: true,
    orderDetail: { include: { product: true } },
} as const;

// decidir entre pagar una orden o una cuota ya sea por medio de order_detail_null o scheduled_payment_id respectivamente
async function resolveTarget(prisma: PrismaClient, orderId: string, target: CreatePaymentInput["target"]) {
    // discenrnir entre realizar el pago de una cuota o de una order.
    // esto permite registrar pagos para productos que no cuentan monto de inscripcion
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
        return { scheduled_payment_id: sp.id, order_detail_id: null as string | null, expectedAmount: Number(sp.due_amount) };
    }

    const detail = await prisma.orderDetail.findUnique({
        where: { id: target.order_detail_id },
        include: { product: { include: { edition: true } } },
    });
    if (!detail || detail.order_id !== orderId) throw new HTTPException(404, { message: "Ítem de orden no encontrado" });
    // posible conflicto entre producto que no sean asincronos y no cuenten con un monto de matricula

    if (detail.product.edition.modality !== "ASINCRONICO") {
        throw new HTTPException(400, { message: "FULL_CASH solo aplica a productos ASINCRONICO — usa una cuota programada" });
    }

    // verificar que el item no tenga ningun pago registrado
    const existing = await prisma.payment.findFirst({
        where: { order_detail_id: detail.id, payment_status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (existing) throw new HTTPException(409, { message: "Este ítem ya tiene un pago registrado" });

    return { scheduled_payment_id: null as string | null, order_detail_id: detail.id, expectedAmount: Number(detail.price) };
}

// cambiar el estado de la order al momento de verificar que todos los pagos correspondientes han sido confirmados
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

// conversion de leads a clientes
async function ensureCustomerProfile(tx: Tx, orderId: string) {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { member: { select: { lead_id: true } } } });
    const leadId = order.member.lead_id;

    // evitar realizar la conversion si un lead ya fue convertido a cliente
    if (await tx.customerProfile.findUnique({ where: { lead_id: leadId } })) return;

    const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId }, select: { first_name: true, last_name: true } });
    // formateando el nombre del cliente para crear un usuario en moodle
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
            const where: PaymentWhereInput = { ...(order_id && { order_id }), ...(payment_status && { payment_status }) };
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

            const order = await prisma.order.findUnique({
                where: { id: data.order_id },
                select: { id: true, order_status: true, assigned_to: true },
            });

            // validaciones antes de la creación del pago
            if (!order) throw new HTTPException(404, { message: "Order not found" });
            if (authUser.role === "SALES_REP" && order.assigned_to !== authUser.userId) {
                throw new HTTPException(403, { message: "No tienes acceso a esta orden" });
            }
            if (order.order_status === "CANCELLED" || order.order_status === "REFUNDED") {
                throw new HTTPException(400, { message: `No se pueden registrar pagos en una orden ${order.order_status}` });
            }

            const resolved = await resolveTarget(prisma, data.order_id, data.target);
            if (Number(data.amount) !== resolved.expectedAmount) {
                throw new HTTPException(400, { message: `El monto debe ser ${resolved.expectedAmount.toFixed(2)}` });
            }

            return prisma.payment.create({
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
        },
        async cancel(id: string) {
            const payment = await prisma.payment.findUnique({ where: { id }, select: { id: true, payment_status: true } });
            if (!payment) throw new HTTPException(404, { message: "Payment not found" });
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
                throw new HTTPException(400, { message: `No se puede modificar un pago ${payment.payment_status}` });
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