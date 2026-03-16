import { Hono } from "hono";
import prisma from "../lib/prisma";

export const dashboardRoutes = new Hono()
  .get("/payments", async (c) => {
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

      return c.json({ total: data.length, payments: data }, 200);
    } catch (error) {
      console.error("[DASHBOARD] getPaymentsDashboard failed:", error);
      return c.json({ error: "Failed to load payments dashboard" }, 500);
    }
  });
