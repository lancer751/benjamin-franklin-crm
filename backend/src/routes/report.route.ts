import { Hono } from "hono";
import prisma from "@lib/prisma";

export const reportRoutes = new Hono()
  .get("/sales", async (c) => {
    try {
      const startDate = c.req.query("startDate");
      const endDate = c.req.query("endDate");
      const courseId = c.req.query("courseId");
      const paymentMethod = c.req.query("paymentMethod");

      // Validate required parameters
      if (!startDate || !endDate) {
        return c.json(
          {
            error:
              "startDate and endDate are required (ISO format: YYYY-MM-DD)",
          },
          400,
        );
      }

      // Validate and parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return c.json(
          { error: "Invalid date format. Use ISO format (YYYY-MM-DD)" },
          400,
        );
      }

      if (start > end) {
        return c.json(
          { error: "startDate must be before or equal to endDate" },
          400,
        );
      }

      // Set end date to end of day
      end.setHours(23, 59, 59, 999);

      // Build where conditions
      const enrollmentWhere: Record<string, unknown> = {
        estado: "completado",
        ...(courseId && {
          edicion: {
            curso: { id: courseId },
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
                  edicion: { curso: { id: courseId } },
                },
              },
            },
          }),
        },
        estado: "confirmado",
        fecha_pago: { gte: start, lte: end },
        ...(paymentMethod && { metodo_pago: paymentMethod }),
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
          (revenueByMonthMap.get(month) ?? 0) + Number(pago.cantidad),
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
        0,
      );
      const totalPayments = payments.length;

      return c.json(
        {
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
        },
        200,
      );
    } catch (error) {
      console.error("[REPORTS] getSalesReport failed:", error);
      return c.json(
        {
          error: "Failed to generate sales report",
          message:
            process.env.NODE_ENV === "development"
              ? (error as Error).message
              : undefined,
        },
        500,
      );
    }
  });
