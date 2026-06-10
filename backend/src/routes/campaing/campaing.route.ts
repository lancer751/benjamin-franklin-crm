// routes/campaign.route.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import type { SuccessResponse } from "@/app";
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  AssignSellersSchema,
  CampaignQuerySchema,
} from "shared";
import { campaignRepository } from "@/repositories/campaign.repository";

const UUIDParam = z.object({ id: z.string().uuid().length(36) });

// ── Error helper ─────────────────────────────────────────────────────────────
// Translates repository error codes into HTTP exceptions so routes stay clean
function handleRepoError(err: unknown): never {
  if (err && typeof err === "object" && "code" in err) {
    const e = err as { code: string; message: string };
    const statusMap: Record<string, 400 | 404 | 409 | 422> = {
      NOT_FOUND: 404,
      CONFLICT: 409,
      INVALID: 422,
    };
    throw new HTTPException(statusMap[e.code] ?? 400, { message: e.message });
  }
  throw err;
}

export const campaignRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)

  // GET /campaigns
  .get("/", zValidator("query", CampaignQuerySchema), async (c) => {
    const repo = campaignRepository(c.get("prisma"));
    const query = c.req.valid("query");
    const result = await repo.findMany(query);
    return c.json<SuccessResponse<typeof result>>(
      { success: true, message: "Campaigns retrieved", data: result },
      200,
    );
  })

  // GET /campaigns/:id
  .get("/:id", zValidator("param", UUIDParam), async (c) => {
    const { id } = c.req.valid("param");
    const repo = campaignRepository(c.get("prisma"));
    const campaign = await repo.findById(id);
    if (!campaign) throw new HTTPException(404, { message: "Campaign not found" });
    return c.json<SuccessResponse<typeof campaign>>(
      { success: true, message: "Campaign retrieved", data: campaign },
      200,
    );
  })

  // POST /campaigns
  .post("/", zValidator("json", CreateCampaignSchema), async (c) => {
    const repo = campaignRepository(c.get("prisma"));
    try {
      const campaign = await repo.create(c.req.valid("json"));
      return c.json<SuccessResponse<typeof campaign>>(
        { success: true, message: "Campaign created", data: campaign },
        201,
      );
    } catch (err) {
      handleRepoError(err);
    }
  })

  // PUT /campaigns/:id
  .put(
    "/:id",
    zValidator("param", UUIDParam),
    zValidator("json", UpdateCampaignSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const repo = campaignRepository(c.get("prisma"));
      const existing = await repo.findById(id);
      if (!existing) throw new HTTPException(404, { message: "Campaign not found" });

      try {
        const updated = await repo.update(id, c.req.valid("json"));
        return c.json<SuccessResponse<typeof updated>>(
          { success: true, message: "Campaign updated", data: updated },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )

  // DELETE /campaigns/:id
  .delete("/:id", zValidator("param", UUIDParam), async (c) => {
    const { id } = c.req.valid("param");
    const repo = campaignRepository(c.get("prisma"));
    try {
      await repo.delete(id);
      return c.json<SuccessResponse>(
        { success: true, message: "Campaign deleted" },
        200,
      );
    } catch (err) {
      handleRepoError(err);
    }
  })

  // POST /campaigns/:id/sellers  — assign sellers
  .post(
    "/:id/sellers",
    zValidator("param", UUIDParam),
    zValidator("json", AssignSellersSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const repo = campaignRepository(c.get("prisma"));
      try {
        const result = await repo.assignSellers(id, c.req.valid("json"));
        return c.json<SuccessResponse<typeof result>>(
          { success: true, message: "Sellers assigned", data: result },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )

  // DELETE /campaigns/:id/sellers/:sellerId  — remove seller from campaign
  .delete(
    "/:id/sellers/:sellerId",
    zValidator("param", z.object({ id: z.string().uuid().length(36), sellerId: z.string().uuid().length(36) })),
    async (c) => {
      const { id, sellerId } = c.req.valid("param");
      const repo = campaignRepository(c.get("prisma"));
      try {
        await repo.removeSeller(id, sellerId);
        return c.json<SuccessResponse>(
          { success: true, message: "Seller removed from campaign" },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  );