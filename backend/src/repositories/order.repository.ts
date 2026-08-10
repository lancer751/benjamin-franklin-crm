import type { OrderInclude, OrderStatus, OrderWhereInput, PrismaClient } from "@repo/database";
import { HTTPException } from "hono/http-exception";
import type { OrderQuery } from "shared";

const orderInclude = {
  orderDetails: {
    select: {
      id: true,
      order_id: true,
      base_price: true,
      discount_amount: true,
      price: true,
      payment_modality: true,
      attendance_mode: true,
      product: {
        select: {
          id: true,
          name: true,
          category: {
            select: { name: true },
          },
          image_url: true,
          enrollment_fee: true,
          installments_min_number: true,
          installments_max_number: true,
          edition: { select: { modality: true } },
        }
      },
      discountCode: true,
      paymentPlan: {
        include: {
          installments: {
            orderBy: { number: "asc" as const },
            include: {
              payments: {
                select: { id: true, payment_status: true, payment_date: true },
              },
            },
          },
        },
      }
    }
  },
  member: {
    select: {
      lead: {
        select: { id: true, first_name: true, last_name: true, }
      }, id: true, campaing_id: true
    }
  },
  userCreator: {
    select: {
      id: true, first_name: true, last_name: true
    }
  },
  assignedUser: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
    }
  },
} satisfies OrderInclude;

export function orderRepository(prisma: PrismaClient) {
  return {
    async findMany({ limit, page, generated_by, member_id, order_status, creation_order }: OrderQuery) {
      const skip = (page - 1) * limit;
      const where: OrderWhereInput = {
        ...(generated_by && { generated_by }),
        ...(member_id && { member_id }),
        ...(order_status && { order_status }),
      };
      const [orders, total] = await Promise.all([
        prisma.order.findMany({ where, skip, take: limit, orderBy: { created_at: creation_order }, include: orderInclude }),
        prisma.order.count({ where }),
      ]);
      return { orders, total, page, limit };
    },
    async findById(id: string) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { ...orderInclude, payments: true, _count: { select: { payments: true, orderDetails: true } } },
      });
      if (!order) throw new HTTPException(404, { message: "Order not found" });
      return order;
    },
    async updateStatus(id: string, status: OrderStatus) {
      const order = await prisma.order.findUnique({ where: { id }, include: { payments: true } });
      if (!order) throw new HTTPException(404, { message: "Order not found" });

      if (status === "COMPLETED" && order.order_status !== "COMPLETED") {
        const confirmedTotal = order.payments
          .filter((p) => p.payment_status === "CONFIRMED")
          .reduce((sum, p) => sum + Number(p.amount), 0);
        if (confirmedTotal < Number(order.total_amount)) {
          throw new HTTPException(400, { message: "Cannot complete an order with an unpaid balance" });
        }
      }
      if (status === "CANCELLED" && order.payments.some((p) => p.payment_status === "CONFIRMED")) {
        throw new HTTPException(400, { message: "Cannot cancel an order with confirmed payments — issue a refund instead" });
      }

      return prisma.order.update({ where: { id }, data: { order_status: status }, include: orderInclude });
    },

    async updateAssignment(id: string, assignedTo: string) {
      const [order, user] = await Promise.all([
        prisma.order.findUnique({ where: { id }, select: { id: true } }),
        prisma.user.findUnique({ where: { id: assignedTo }, select: { id: true, is_active: true } }),
      ]);
      if (!order) throw new HTTPException(404, { message: "Order not found" });
      if (!user?.is_active) throw new HTTPException(404, { message: "Target user not found or inactive" });

      return prisma.order.update({ where: { id }, data: { assigned_to: assignedTo }, include: orderInclude });
    },

    cancel(id: string) {
      return this.updateStatus(id, "CANCELLED");
    },
  };
}
