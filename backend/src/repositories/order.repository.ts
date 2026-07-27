import type {
  OrderInclude,
  OrderWhereInput,
  PrismaClient,
} from "@repo/database";
import type { OrderQuery } from "shared";

export function orderRepository(prisma: PrismaClient) {
  return {
    async findMany({
      limit,
      page,
      generated_by,
      lead_id,
      order_status,
      creation_order,
    }: OrderQuery) {
      const skip = (page - 1) * limit;
      const where: OrderWhereInput = {
        ...(generated_by && { generated_by }),
        ...(lead_id && { lead_id }),
        ...(order_status && { order_status }),
      };

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: creation_order },
          include: {
            orderDetails: {
              include: {
                product: true,
              },
            },
            lead: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      return { orders, total, page, limit };
    },
    async findById(id: string) {
      const orderInclude: OrderInclude = {
        orderDetails: { include: { product: true } },
        lead: true,
      };
      return prisma.order.findUnique({
        where: { id },
        include: {
          ...orderInclude,
          payments: true,
          _count: {
            select: {
                payments: true,
                orderDetails: true
            }
          }
        },
      });
    },
  };
}
