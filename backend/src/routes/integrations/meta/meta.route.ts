import type { SuccessResponse } from "@/app";
import { verifyUserAccessAuth, verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { handleRepoError } from "@/routes/lead/lead.route";
import { metaService } from "@/services/metaservice";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// GET /meta/campaigns — step: pick a Meta campaign to link
export const metaRoutes = new Hono()
  .get(
    "/campaigns",
    verifyUserAccessAuth,
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_SUPERVISOR"),
    async (c) => {
      try {
        const campaigns = await metaService.listCampaigns();
        return c.json<SuccessResponse<typeof campaigns>>(
          { success: true, message: "Meta campaigns fetched", data: campaigns },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )
  // GET /meta/campaigns/:metaCampaignId/forms — step: pick a lead form
  .get(
    "/campaigns/:metaCampaignId/forms",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_SUPERVISOR"),
    zValidator("param", z.object({ metaCampaignId: z.string() })),
    async (c) => {
      const { metaCampaignId } = c.req.valid("param");
      try {
        const forms = await metaService.listLeadForms(metaCampaignId);
        return c.json<SuccessResponse<typeof forms>>(
          { success: true, message: "Lead forms fetched", data: forms },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  );
