import { prisma } from "../config/connection";
import type { Request, Response } from "express";
import type { CreateOrderDTO } from "../types/order.type";
import { CompraEstado } from "../../generated/prisma/enums";
import { faker } from "@faker-js/faker";

export async function getOrders(req: Request, res: Response) {
  try {
    const orders = await prisma.compra.findMany({
      select: {
        id: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido_materno: true,
            apellido_paterno: true,
          },
        },
        vendedor: {
          select: {
            id: true,
            nombre: true,
            apellido_materno: true,
            apellido_paterno: true,
          },
        },
        costo_total: true,
        estado_order: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const customizedReponse = orders.map((order) => ({
      id: order.id,
      costo_total: order.costo_total,
      estado_order: order.estado_order,
      cliente: {
        id: order.cliente.id,
        fullname: `${order.cliente.nombre} ${order.cliente.apellido_paterno} ${order.cliente.apellido_materno}`,
      },
      vendedor: order.vendedor
        ? {
            id: order.vendedor.id,
            fullname: `${order.vendedor.nombre} ${order.vendedor.apellido_paterno} ${order.vendedor.apellido_materno}`,
          }
        : null,
      created_at: order.createdAt,
    }));

    return res.status(200).json(customizedReponse);
  } catch (error) {
    console.error("Error in getOrders", error);
    res.status(500);
  }
}

export async function createOrder(
  req: Request<unknown, unknown, CreateOrderDTO>,
  res: Response,
) {
  try {
    const { cliente_id, vendedor_id, detalles } = req.body;

    if (!cliente_id || detalles.length === 0) {
      return res.status(400).json({
        message: "cliente_id and detalles are required",
      });
    }

    if (vendedor_id) {
      const isValidVendedor = await prisma.usuario.findUnique({
        where: { id: vendedor_id, role: { nombre: "ventas" } },
      });
      if (!isValidVendedor) {
        return res.status(400).json({
          message:
            "No user found with the provided vendedor_id or user is not a vendedor",
        });
      }
    }

    const costo_total = detalles.reduce<number>(
      (sum, item) => sum + item.costo_unitario,
      0,
    );

    // Use a transaction to ensure atomicity
    // This will create the compra and all related detalleCompra entries in one go
    // If any part fails, the entire transaction will be rolled back
    const order = await prisma.$transaction(async (tx) => {
      const compra = await tx.compra.create({
        data: {
          cliente_id,
          vendedor_id: vendedor_id ?? null,
          costo_total,
          numero_order: faker.string.alphanumeric(10).toUpperCase(),
          estado_order: CompraEstado.pendiente,
        },
      });

      // Create detalleCompra entries
      await tx.detalleCompra.createMany({
        data: detalles.map((item) => ({
          compra_id: compra.id,
          producto_id: item.producto_id,
          costo_unitario: item.costo_unitario,
        })),
      });

      return compra;
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error in createOrder", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getOrderById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const order = await prisma.compra.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
          },
        },
        vendedor: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
          },
        },
        detalles: {
          include: {
            producto: {
              include: {
                edicion: {
                  include: {
                    curso: { select: { nombre: true } },
                    modalidad: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                  omit: {
                    createdAt: true,
                    updatedAt: true,
                    curso_id: true,
                    fecha_finalizacion: true,
                    fecha_inicio: true,
                    id: true,
                    modalidad_id: true,
                    moodle_course_id: true,
                  },
                },
              },
              omit: {
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          omit: {
            createdAt: true,
            updatedAt: true,
            compra_id: true,
            id: true,
          },
        },
        pagos: {
          select: {
            id: true,
            cantidad: true,
            estado: true,
            fecha_pago: true,
            metodo_pago: true,
          },
        },
      },
      omit: {
        cliente_id: true,
        vendedor_id: true,
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const customizedResponse = {
      id: order.id,
      estado_order: order.estado_order,
      costo_total: order.costo_total,
      cliente: {
        id: order.cliente.id,
        fullname: `${order.cliente.nombre} ${order.cliente.apellido_paterno} ${order.cliente.apellido_materno}`,
      },
      vendedor: order.vendedor
        ? {
            id: order.vendedor.id,
            fullname: `${order.vendedor.nombre} ${order.vendedor.apellido_paterno} ${order.vendedor.apellido_materno}`,
          }
        : null,
      order_detail: order.detalles.map((item) => ({
        producto_id: item.producto_id,
        precio: item.costo_unitario,
        course_name: item.producto.edicion.curso.nombre,
        edicion_id: item.producto.edicion_id,
        modalidad: item.producto.edicion.modalidad.nombre,
      })),
      pagos: order.pagos,
    };

    return res.status(200).json(customizedResponse);
  } catch (error) {
    console.error("Error in getOrderById", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateSingleOrder(
  req: Request<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;
  const { cliente_id, vendedor_id, detalles } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const existingOrder = await prisma.compra.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = await prisma.compra.update({
      where: { id },
      data: {
        cliente_id,
        vendedor_id,
        detalles: {
          updateMany: detalles.map(
            (item: { producto_id: string; costo_unitario: number }) => ({
              producto_id: item.producto_id,
              costo_unitario: item.costo_unitario,
            }),
          ),
        },
      },
    });

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateSingleOrder", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
