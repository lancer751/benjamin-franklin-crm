import { Hono } from "hono";
import prisma from "../lib/prisma";
import { zValidator } from "@hono/zod-validator";
import {
  createLeadInteractionSchema,
  createLeadSchema,
  updateLeadSchema,
} from "@/zod-schemas/lead.schema";
import { UUID_ROUTE } from "@/helpers/constants";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { SuccessResponse } from "@/app";

export const leadRoutes = new Hono()
  .get("/", async (c) => {
    const leads = await prisma.lead.findMany();
    return c.json(leads, 200);
  })
  // lead details
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    async (c) => {
      const id = c.req.param("id");
      const lead = await prisma.lead.findUnique({
        where: { id },
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
  // get lead interactions
  .get(
    `/${UUID_ROUTE}/interactions`,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const id = c.req.param("id");
      const interactions = await prisma.leadInteraction.findMany({
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
    const newLead = await prisma.lead.create({
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
  // create a lead from external source
  .post("/external", zValidator("json", createLeadSchema), async (c) => {
    const lead = c.req.valid("json");

    // creating the lead and the lead interaction at the same time, since we know that if the lead is being created from an external source, it means that there was an interaction with the lead, and we want to keep track of that interaction in our system
    const newLead = await prisma.$transaction(async (tx) => {
      const createdLead = await tx.lead.create({
        data: lead,
      });

      if (!createdLead) {
        throw new HTTPException(500, {
          message: "Failed to create lead from external source",
        });
      }

      await tx.leadInteraction.create({
        data: {
          lead_id: createdLead.id,
          notes: `Lead created from: ${lead.source}`,
          created_by: newLead.assigned_to
        },
      });
      return createdLead;
    });
    return c.json<SuccessResponse<typeof newLead>>(
      {
        success: true,
        message: "Lead created successfully from external source",
        data: newLead,
      },
      201,
    );
  })
  // register lead interaction manually from the CRM
  .post(
    "/interactions",
    zValidator("json", createLeadInteractionSchema),
    async (c) => {
      const interactionData = c.req.valid("json");
      const newInteraction = await prisma.leadInteraction.create({
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
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    zValidator("json", updateLeadSchema),
    async (c) => {
      const id = c.req.param("id");
      const lead = c.req.valid("json");

      const existingLead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!existingLead) {
        throw new HTTPException(404, { message: "Lead not found" });
      }

      const updatedLead = await prisma.lead.update({
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
    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      throw new HTTPException(404, { message: "Lead not found" });
    }
    await prisma.lead.delete({
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
