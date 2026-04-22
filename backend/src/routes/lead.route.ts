import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createLeadFromExternalSchema,
  createLeadInteractionSchema,
  createLeadSchema,
  updateLeadSchema,
} from "@shared/dist";
import { UUID_ROUTE } from "@/helpers/constants";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";

export const leadRoutes = new Hono<ContextWithPrisma>()
  .get("/", async (c) => {
    const leads = await c.get("prisma").lead.findMany({
      include: {
        leadPrimaryCampaing: true
      }
    });
    return c.json(leads, 200);
  })
  // lead details
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    async (c) => {
      const id = c.req.param("id");
      // return the campaings that the lead is associated with, and the interactions that the lead has had
      const lead = await c.get("prisma").lead.findUnique({
        where: { id },
        include: {
          interactions: true,
          campaignsEngaging: { include: { campaing: true } },
        },
      });

      if (!lead) {
        throw new HTTPException(404, { message: "Lead not found" });
      }

      return c.json<SuccessResponse<typeof lead>>(
        {
          success: true,
          message: "Lead retrieved successfully",
          data: lead,
        },
        200,
      );
    },
  )
  // get lead interactions without specifying a campaing
  // TODO: add filtering and sortering and pagination
  .get(
    `/${UUID_ROUTE}/interactions`,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const id = c.req.param("id");
      const interactions = await c.get("prisma").leadInteraction.findMany({
        where: { lead_id: id },
        include: {
          seller: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  middle_name: true,
                },
              },
            },
          },
        },
      });

      const formattedInteractions = interactions.map((interaction) => ({
        ...interaction,
        created_by: interaction.seller
          ? interaction.seller.user.first_name
          : "External System",
      }));

      return c.json(formattedInteractions, 200);
    },
  )
  .post("/", zValidator("json", createLeadSchema), async (c) => {
    const lead = c.req.valid("json");
    // lead phone is missing, adjust the schema to handle it
    const newLead = await c.get("prisma").lead.create({
      data: lead,
    });
    return c.json<SuccessResponse<typeof newLead>>(
      {
        success: true,
        message: "Lead created successfully",
        data: newLead,
      },
      201,
    );
  })
  // create a lead and its interactions from external source
  .post(
    "/external",
    zValidator("json", createLeadFromExternalSchema),
    async (c) => {
      const lead = c.req.valid("json");
      const { lead_interaction, source, campaing_id, ...formattedLead } =
        structuredClone(lead);
      const { notes, type } = lead_interaction;
      // creating the lead and the lead interaction at the same time, since we know that if the lead is being created from an external source, it means that there was an interaction with the lead, and we want to keep track of that interaction in our system
      const existingLead = await c.get("prisma").lead.findUnique({
        where: { email: lead.email },
      });

      const existingCampaignSeller = await c.get("prisma").campaignSeller.findFirst({
        where: { campaign_id: campaing_id },
      });

      if (!existingCampaignSeller) {
        throw new HTTPException(404, {
          message: `Campaign with id ${campaing_id} doesn't exist`,
        });
      }

      // if the lead already exists, we only create a new interaction, otherwise we create the lead, a campaingmember and the interaction
      await c.get("prisma").$transaction(async (tx) => {
        const createdLead =
          existingLead ??
          (await tx.lead.create({
            data: { ...formattedLead, primary_campaign_id: campaing_id },
          }));

        // creating a new campaign member if the lead doesn't exist
        const existingCampaingMember = await tx.campaignMember.findFirst({
          where: {
            campaing_id,
            lead_id: createdLead.id,
          },
        });

        if (!existingCampaingMember) {
          await tx.campaignMember.create({
            data: {
              source: source,
              campaing_id: campaing_id,
              lead_id: createdLead.id,
              is_primary: existingLead ? true : false,
              assigned_to: existingCampaignSeller.seller_id,
            },
          });
        }

        // creating a new interaction
        await tx.leadInteraction.create({
          data: {
            campaing_id: campaing_id,
            notes,
            lead_id: createdLead.id,
            type,
          },
        });
      });
      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Lead created successfully from external source",
        },
        201,
      );
    },
  )
  // register lead interaction manually from the CRM
  .post(
    "/interactions",
    zValidator("json", createLeadInteractionSchema),
    async (c) => {
      const interactionData = c.req.valid("json");

      const existingCampaingMember = await c.get("prisma").campaignMember.findUnique({
        where: {
          lead_id_campaing_id: {
            campaing_id: interactionData.campaing_id,
            lead_id: interactionData.lead_id,
          },
        },
      });

      if (!existingCampaingMember) {
        throw new HTTPException(500, {
          message:
            "You can't add an interaction if the user hasn't been added to a Campaing",
        });
      }

      const newInteraction = await c.get("prisma").leadInteraction.create({
        data: interactionData,
      });

      return c.json<SuccessResponse<typeof newInteraction>>(
        {
          success: true,
          message: "Lead interaction created successfully",
          data: newInteraction,
        },
        201,
      );
    },
  )
  // TODO: when updating the primary_id_campaign from lead, the field is_primary from campaingmember must be updated
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    zValidator("json", updateLeadSchema),
    async (c) => {
      const id = c.req.param("id");
      const lead = c.req.valid("json");

      const existingLead = await c.get("prisma").lead.findUnique({
        where: { id },
      });

      if (!existingLead) {
        throw new HTTPException(404, { message: "Lead not found" });
      }

      const updatedLead = await c.get("prisma").lead.update({
        data: lead,
        where: {
          id,
        },
      });

      return c.json<SuccessResponse<typeof updatedLead>>(
        {
          success: true,
          message: "Lead updated successfully",
          data: updatedLead,
        },
        200,
      );
    },
  )
  .delete(UUID_ROUTE, async (c) => {
    const id = c.req.param("id");
    const existingLead = await c.get("prisma").lead.findUnique({ where: { id } });
    if (!existingLead) {
      throw new HTTPException(404, { message: "Lead not found" });
    }

    //TODO: config error cascade deletion when a lead is related to another table.
    await c.get("prisma").lead.delete({
      where: { id },
    });

    return c.json<SuccessResponse>(
      {
        success: true,
        message: "Lead deleted successfully",
      },
      200,
    );
  });
