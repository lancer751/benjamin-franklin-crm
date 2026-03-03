// Reports controller — sales and enrollment metrics with filter support.

import type { Request, Response } from "express";
import { prisma } from "../config/connection";

/**
 * GET /reports/sales
 * Query params: startDate, endDate, courseId, paymentMethod
 */
export async function getSalesReport(req: Request, res: Response) {
    try {
        const { startDate, endDate, courseId, paymentMethod } = req.query;

        // Build date filter for Pago
        const dateFilter: Record<string, Date> = {};
        if (startDate) dateFilter.gte = new Date(startDate as string);
        if (endDate) dateFilter.lte = new Date(endDate as string);

        // ── 1. Enrolled students per course ──────────────────────────────────────
        const enrollmentsByCourse = await prisma.matricula.groupBy({
            by: ["curso_id"],
            _count: { id: true },
            where: courseId ? { curso_id: courseId as string } : undefined,
        });

        const courseIds = enrollmentsByCourse.map((e) => e.curso_id);
        const courses = await prisma.curso.findMany({
            where: { id: { in: courseIds } },
            select: { id: true, nombre: true },
        });
        const courseMap = new Map(courses.map((c) => [c.id, c.nombre]));

        const studentsPerCourse = enrollmentsByCourse.map((e) => ({
            cursoId: e.curso_id,
            cursoNombre: courseMap.get(e.curso_id) ?? "Desconocido",
            totalMatriculas: e._count.id,
        }));

        // ── 2. Total revenue per course (via DetalleCompra → Producto → Edicion → Curso) ──
        const pagoWhere: Record<string, unknown> = {
            estado: "confirmado",
            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
            ...(paymentMethod ? { metodo_pago: paymentMethod } : {}),
        };

        const confirmedPayments = await prisma.pago.findMany({
            where: pagoWhere,
            include: {
                compra: {
                    include: {
                        detalles: {
                            include: {
                                producto: {
                                    include: {
                                        edicion: { include: { curso: { select: { id: true, nombre: true } } } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Aggregate revenue per course
        const revenueByCourseMap = new Map<string, { nombre: string; total: number }>();
        for (const pago of confirmedPayments) {
            for (const detalle of pago.compra.detalles) {
                const curso = detalle.producto.edicion.curso;
                if (courseId && curso.id !== courseId) continue;
                const existing = revenueByCourseMap.get(curso.id) ?? { nombre: curso.nombre, total: 0 };
                existing.total += Number(detalle.costo_unitario);
                revenueByCourseMap.set(curso.id, existing);
            }
        }

        const revenuePerCourse = Array.from(revenueByCourseMap.entries()).map(
            ([cursoId, data]) => ({ cursoId, cursoNombre: data.nombre, totalRevenue: data.total })
        );

        // ── 3. Total revenue per month ───────────────────────────────────────────
        const revenueByMonth: Record<string, number> = {};
        for (const pago of confirmedPayments) {
            const month = new Date(pago.createdAt).toISOString().slice(0, 7); // "YYYY-MM"
            revenueByMonth[month] = (revenueByMonth[month] ?? 0) + Number(pago.cantidad);
        }
        const revenuePerMonth = Object.entries(revenueByMonth)
            .map(([month, total]) => ({ month, totalRevenue: total }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // ── 4. Payment method distribution ──────────────────────────────────────
        const methodGroups = await prisma.pago.groupBy({
            by: ["metodo_pago"],
            _count: { id: true },
            _sum: { cantidad: true },
            where: pagoWhere,
        });

        const paymentMethodDistribution = methodGroups.map((g) => ({
            method: g.metodo_pago,
            count: g._count.id,
            totalAmount: Number(g._sum.cantidad ?? 0),
        }));

        return res.status(200).json({
            filters: { startDate, endDate, courseId, paymentMethod },
            studentsPerCourse,
            revenuePerCourse,
            revenuePerMonth,
            paymentMethodDistribution,
        });
    } catch (error) {
        console.error("[REPORTS] getSalesReport failed:", error);
        return res.status(500).json({ error: "Failed to generate sales report" });
    }
}
