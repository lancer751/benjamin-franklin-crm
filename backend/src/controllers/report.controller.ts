// Reports controller — sales and enrollment metrics with filter support.

import type { Request, Response } from "express";
import { prisma } from "../config/connection";

/**
 * GET /reports/sales
 * Query params: startDate, endDate, courseId (optional), paymentMethod (optional)
 * startDate and endDate are required and should be in ISO format (YYYY-MM-DD)
 */
export async function getSalesReport(req: Request, res: Response) {
  try {
    const { startDate, endDate, courseId, paymentMethod } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required (ISO format: YYYY-MM-DD)",
      });
    }

    // Validate and parse dates
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Invalid date format. Use ISO format (YYYY-MM-DD)",
      });
    }

    if (start > end) {
      return res.status(400).json({
        error: "startDate must be before or equal to endDate",
      });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Build where conditions
    const enrollmentWhere: Record<string, unknown> = {
      estado: "completado",
      ...(courseId && {
        edicion: {
          curso: { id: courseId as string },
        },
      }),
    };

    const paymentWhere: Record<string, unknown> = {
      compra: {
        estado_order: "pagado",
        ...(courseId && {
          detalles: {
            some: {
              producto: {
                edicion: { curso: { id: courseId as string } },
              },
            },
          },
        }),
      },
      estado: "confirmado",
      fecha_pago: { gte: start, lte: end },
      ...(paymentMethod && { metodo_pago: paymentMethod as string }),
    };

    // ── 1. Completed enrollments per course ──────────────────────────────────
    const enrollments = await prisma.matricula.findMany({
      where: enrollmentWhere,
      include: {
        edicion: {
          include: {
            curso: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    const enrollmentMap = new Map<
      string,
      { cursoId: string; cursoNombre: string; count: number }
    >();
    for (const enroll of enrollments) {
      const cursoId = enroll.edicion.curso.id;
      const existing = enrollmentMap.get(cursoId) ?? {
        cursoId,
        cursoNombre: enroll.edicion.curso.nombre,
        count: 0,
      };
      existing.count++;
      enrollmentMap.set(cursoId, existing);
    }

    const studentsPerCourse = Array.from(enrollmentMap.values());

    // ── 2. Total revenue per course ──────────────────────────────────────────
    const payments = await prisma.pago.findMany({
      where: paymentWhere,
      include: {
        compra: {
          include: {
            detalles: {
              include: {
                producto: {
                  include: {
                    edicion: {
                      include: {
                        curso: { select: { id: true, nombre: true } },
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

    const revenueByCourseMap = new Map<
      string,
      { cursoId: string; cursoNombre: string; totalRevenue: number }
    >();
    for (const pago of payments) {
      for (const detalle of pago.compra.detalles) {
        const curso = detalle.producto.edicion.curso;
        const existing = revenueByCourseMap.get(curso.id) ?? {
          cursoId: curso.id,
          cursoNombre: curso.nombre,
          totalRevenue: 0,
        };
        existing.totalRevenue += Number(detalle.costo_unitario);
        revenueByCourseMap.set(curso.id, existing);
      }
    }

    const revenuePerCourse = Array.from(revenueByCourseMap.values());

    // ── 3. Total revenue per month ───────────────────────────────────────────
    const revenueByMonthMap = new Map<string, number>();
    for (const pago of payments) {
      const month = new Date(pago.fecha_pago!).toISOString().slice(0, 7); // "YYYY-MM"
      revenueByMonthMap.set(
        month,
        (revenueByMonthMap.get(month) ?? 0) + Number(pago.cantidad)
      );
    }

    const revenuePerMonth = Array.from(revenueByMonthMap.entries())
      .map(([month, totalRevenue]) => ({ month, totalRevenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // ── 4. Payment method distribution ──────────────────────────────────────
    const methodGroups = await prisma.pago.groupBy({
      by: ["metodo_pago"],
      _count: { id: true },
      _sum: { cantidad: true },
      where: paymentWhere,
    });

    const paymentMethodDistribution = methodGroups.map((g) => ({
      method: g.metodo_pago,
      count: g._count.id,
      totalAmount: Number(g._sum.cantidad ?? 0),
    }));

    // ── 5. Summary statistics ────────────────────────────────────────────────
    const totalRevenue = payments.reduce(
      (sum, pago) => sum + Number(pago.cantidad),
      0
    );
    const totalPayments = payments.length;

    return res.status(200).json({
      filters: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        courseId: courseId || null,
        paymentMethod: paymentMethod || null,
      },
      summary: {
        totalRevenue,
        totalPayments,
        totalCompletedEnrollments: enrollments.length,
        uniqueCoursesWithRevenue: revenueByCourseMap.size,
      },
      studentsPerCourse,
      revenuePerCourse,
      revenuePerMonth,
      paymentMethodDistribution,
    });
  } catch (error) {
    console.error("[REPORTS] getSalesReport failed:", error);
    return res.status(500).json({
      error: "Failed to generate sales report",
      message:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
}
