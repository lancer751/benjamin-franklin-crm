import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserAccessAuth, verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { CreatePaymentSchema, UpdatePaymentStatusSchema, PaymentQuerySchema, EvidenceUploadRequestSchema } from "shared";
import { paymentRepository } from "@/repositories/payment.repository";
import { createEvidenceUploadUrl, getEvidenceViewUrl } from "@/lib/storage";

const UUIDParam = z.object({ id: z.uuid().length(36) });

export const paymentRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR", "COLLECTIONS"))

  .get("/", zValidator("query", PaymentQuerySchema), async (c) => {
    const result = await paymentRepository(c.get("prisma")).findMany(c.req.valid("query"));
    return c.json<SuccessResponse<typeof result>>({ success: true, message: "Payments retrieved", data: result }, 200);
  })

  .get("/:id", zValidator("param", UUIDParam), async (c) => {
    const payment = await paymentRepository(c.get("prisma")).findById(c.req.valid("param").id);
    return c.json<SuccessResponse<typeof payment>>({ success: true, message: "Payment retrieved", data: payment }, 200);
  })

  .get("/:id/receipt-url", zValidator("param", UUIDParam), async (c) => {
    const payment = await paymentRepository(c.get("prisma")).findById(c.req.valid("param").id);
    const url = await getEvidenceViewUrl(payment.payment_receipt);
    return c.json<SuccessResponse<{ url: string }>>({ success: true, message: "Receipt URL generated", data: { url } }, 200);
  })

  .post("/evidence-upload-url", zValidator("json", EvidenceUploadRequestSchema), async (c) => {
    const { file_name, content_type } = c.req.valid("json");
    const upload = await createEvidenceUploadUrl(file_name, content_type);
    return c.json<SuccessResponse<typeof upload>>({ success: true, message: "Upload URL generated", data: upload }, 200);
  })

  .post(
    "/",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("json", CreatePaymentSchema),
    async (c) => {
      const payment = await paymentRepository(c.get("prisma")).create(c.var.authUser, c.req.valid("json"));
      return c.json<SuccessResponse<typeof payment>>(
        { success: true, message: "Payment registered, pending confirmation", data: payment },
        201,
      );
    },
  )

  .patch(
    "/:id/status",
    verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR", "COLLECTIONS"),
    zValidator("param", UUIDParam),
    zValidator("json", UpdatePaymentStatusSchema),
    async (c) => {
      const payment = await paymentRepository(c.get("prisma")).updateStatus(
        c.req.valid("param").id,
        c.var.authUser.userId,
        c.req.valid("json"),
      );
      return c.json<SuccessResponse<typeof payment>>({ success: true, message: "Payment status updated", data: payment }, 200);
    },
  )

  .delete("/:id", zValidator("param", UUIDParam), async (c) => {
    await paymentRepository(c.get("prisma")).cancel(c.req.valid("param").id);
    return c.json<SuccessResponse>({ success: true, message: "Payment deleted" }, 200);
  });