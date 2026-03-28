import { Hono } from "hono";
import prisma from "../lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { CreateLeadSchema, UpdateLeadSchema } from "@/zod-schemas/lead";
import { handleError } from "@/helpers/errorHandling";
import { UUID_ROUTE } from "@/helpers/constants";

export const leadRoutes = new Hono()
  .get("/", async (c) => {
    try {
      const leads = await prisma.lead.findMany();

      return c.json(leads, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Error while getting leads" });
    }
  })
  .get(UUID_ROUTE, async (c) => {
    const id = c.req.param("id");

    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        return c.json({ error: `Lead with ${id} not found` }, 404);
      }
      return c.json(lead, 200);
    } catch (error) {
      console.error("Error fetching lead:", error);
      return c.json({ error: "Failed to fetch lead" }, 500);
    }
  })
  .post("/", zValidator("json", CreateLeadSchema), async (c) => {
    const lead = await c.req.valid("json");
    try {
      const newLead = await prisma.lead.create({
        data: lead,
      });
      return c.json(newLead, 201);
    } catch (error) {
      return handleError(c, error, "Failed to create Lead");
    }
  })
  .put(UUID_ROUTE, zValidator("json", UpdateLeadSchema), async (c) => {
    const id = c.req.param("id");
    const lead = await c.req.valid("json");

    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!existingLead) {
        return c.json({ error: "Lead not found" }, 400);
      }

      const updatedLead = await prisma.lead.update({
        data: lead,
        where: {
          id,
        },
      });

      return c.json(updatedLead, 200);
    } catch (error) {
      console.error(error);
      return handleError(c, error, "Failed to update Lead");
    }
  })
  .delete(UUID_ROUTE, async (c) => {
    const id = c.req.param("id");
    try {
      const existingLead = await prisma.lead.findUnique({ where: { id } });
      if (!existingLead) {
        return c.json({ error: "Lead not found" }, 400);
      }
      await prisma.lead.delete({
        where: { id },
      });

      return c.json({ message: "Lead deleted successfully" }, 200);
    } catch (error) {
      handleError(c, error, "Error while deleting the lead");
    }
  });
