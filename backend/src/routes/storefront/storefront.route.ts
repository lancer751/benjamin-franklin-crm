import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { Hono } from "hono";

export const storefrontRoute = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/products", async (c) => {
    const prisma = c.get("prisma");

    const products = await prisma.product.findMany({
      include: {
        category: {
          omit: {
            created_at: true,
            updated_at: true,
          },
        },
        prices: {
          omit: {
            id: true,
            product_id: true,
          },
        },
        edition: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            schedules: {
              select: {
                day_of_week: true,
                type: true,
                slots: {
                  select: {
                    start_time: true,
                    end_time: true,
                  },
                },
              },
            },
            modality: true,
            hours_amount: true,
            classes_number: true,
            edition_number: true,
            edition_code: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      omit: {
        category_id: true,
        description: true,
        installments_max_number: true,
        installments_min_number: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(products, 200);
  });