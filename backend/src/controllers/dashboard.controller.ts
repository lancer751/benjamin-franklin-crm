// Dashboard controller — payment status overview for frontend.

import type { Request, Response } from "express";
import { prisma } from "../config/connection";

/**
 * GET /dashboard/payments
 * Returns the last 50 payments with customer and course info.
 */
export async function getPaymentsDashboard(req: Request, res: Response) {
    try {
        const pagos = await prisma.pago.findMany({
            take: 50,
            orderBy: { createdAt: "desc" },
            include: {
                compra: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido_paterno: true,
                                email: true,
                                telefono: true,
                            },
                        },
                        detalles: {
                            include: {
                                producto: {
                                    include: {
                                        edicion: {
                                            include: {
                                                curso: {
                                                    select: { id: true, nombre: true },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const data = pagos.map((pago) => ({
            id: pago.id,
            estado: pago.estado,
            metodoPago: pago.metodo_pago,
            cantidad: Number(pago.cantidad),
            codigoTransaccion: pago.codigo_transaccion,
            fechaPago: pago.fecha_pago,
            createdAt: pago.createdAt,
            compraId: pago.compra.id,
            cliente: pago.compra.cliente,
            cursos: pago.compra.detalles.map((d) => ({
                id: d.producto.edicion.curso.id,
                nombre: d.producto.edicion.curso.nombre,
            })),
        }));

        return res.status(200).json({ total: data.length, payments: data });
    } catch (error) {
        console.error("[DASHBOARD] getPaymentsDashboard failed:", error);
        return res.status(500).json({ error: "Failed to load payments dashboard" });
    }
}
