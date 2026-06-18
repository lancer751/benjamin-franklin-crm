import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { UpdateProductComercialContentSchema } from "shared";

export const productsComercialContent = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/commercial-content", async (c) => {
    const products = await c.get("prisma").product.findMany({
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

    return c.json<SuccessResponse<typeof products>>({
      success: true,
      data: products,
      message: "Products commercial content retrieved successfully",
    });
  })
  .get(
    `${UUID_ROUTE}/commercial-content`,
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id } = c.req.valid("param");

      const product = await c.get("prisma").product.findUnique({
        where: { id },
        include: {
          prices: {
            omit: { id: true, product_id: true },
          },
          edition: {
            select: {
              course: {
                select: {
                  name: true,
                },
              },
              classes_number: true,
              duration_unit: true,
              duration_value: true,
              edition_code: true,
              edition_number: true,
            },
          },
          category: { omit: { created_at: true, updated_at: true } },
          orders_details: true,
          relatedBenefits: {
            select: {
              benefits: true,
            },
          },
          frequentQuestions: { select: { faq: true } },
          relatedCertifications: { select: { certification: true } },
        },
        omit: {
          category_id: true,
        },
      });

      if (!product) {
        throw new HTTPException(404, { message: "Product not found" });
      }

      return c.json<SuccessResponse<typeof product>>({
        success: true,
        data: product,
        message: "Product commercial content retrieved successfully",
      });
    },
  )
  .put(
    `${UUID_ROUTE}/commercial-content`,
    zValidator("json", UpdateProductComercialContentSchema),
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id } = c.req.valid("param");
      const { benefit_ids, faq_ids, certification_ids, ...productData } =
        c.req.valid("json");

      //  1. Verify product exists
      const existing = await prisma.product.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Product not found" });
      }

      //  2. Verify all referenced IDs exist (pre-flight, outside transaction) ─
      if (benefit_ids?.length) {
        const found = await prisma.benefit.findMany({
          where: { id: { in: benefit_ids } },
          select: { id: true },
        });
        if (found.length !== benefit_ids.length) {
          const missing = benefit_ids.filter(
            (bid) => !found.some((b) => b.id === bid),
          );
          throw new HTTPException(404, {
            message: `Benefit IDs not found: ${missing.join(", ")}`,
          });
        }
      }
      if (faq_ids?.length) {
        const found = await prisma.fAQ.findMany({
          where: { id: { in: faq_ids } },
          select: { id: true },
        });
        if (found.length !== faq_ids.length) {
          const missing = faq_ids.filter(
            (fid) => !found.some((f) => f.id === fid),
          );
          throw new HTTPException(404, {
            message: `FAQ IDs not found: ${missing.join(", ")}`,
          });
        }
      }

      if (certification_ids?.length) {
        const found = await prisma.certification.findMany({
          where: { id: { in: certification_ids } },
          select: { id: true },
        });
        if (found.length !== certification_ids.length) {
          const missing = certification_ids.filter(
            (cid) => !found.some((cert) => cert.id === cid),
          );
          throw new HTTPException(404, {
            message: `Certification IDs not found: ${missing.join(", ")}`,
          });
        }
      }

      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Benefits — replace if provided
        if (benefit_ids !== undefined) {
          await tx.benefitsOnProduct.deleteMany({ where: { product_id: id } });
        }

        // FAQs — replace if provided
        if (faq_ids !== undefined) {
          await tx.fAQsOnProduct.deleteMany({ where: { product_id: id } });
        }

        // Certifications — replace if provided
        if (certification_ids !== undefined) {
          await tx.certificationsOnProduct.deleteMany({
            where: { product_id: id },
          });
        }

        return tx.product.update({
          where: { id },
          data: {
            ...productData,
            relatedBenefits: benefit_ids?.length
              ? {
                  createMany: {
                    data: benefit_ids.map((benefit_id) => ({ benefit_id })),
                  },
                }
              : undefined,
            frequentQuestions: faq_ids?.length
              ? {
                  createMany: {
                    data: faq_ids.map((faq_id) => ({ faq_id })),
                  },
                }
              : undefined,
            relatedCertifications: certification_ids?.length
              ? {
                  createMany: {
                    data: certification_ids.map((certification_id) => ({
                      certification_id,
                    })),
                  },
                }
              : undefined,
          },
          include: {
            prices: true,
            edition: {
              select: {
                id: true,
                modality: true,
                start_date: true,
                end_date: true,
                edition_code: true,
                course: { select: { name: true } },
              },
            },
            category: { omit: { created_at: true, updated_at: true } },
            relatedBenefits: { include: { benefits: true } },
            frequentQuestions: { include: { faq: true } },
            relatedCertifications: { include: { certification: true } },
          },
        });
      });

      return c.json<SuccessResponse<typeof updatedProduct>>(
        {
          success: true,
          data: updatedProduct,
          message: "Product updated successfully",
        },
        200,
      );
    },
  );
