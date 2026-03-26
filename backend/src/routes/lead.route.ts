import { Hono } from "hono";
import prisma from "../lib/prisma";
import z from "zod";
import { LeadCreateInputObjectSchema } from "../../prisma/generated/schemas";
import { zValidator } from "@hono/zod-validator";


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
  .get("/:id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}", async (c) => {
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
  .post("/", zValidator("json", LeadCreateInputObjectSchema) ,async (c) => {
    const data = await c.req.valid("json")
    const lead = LeadCreateInputObjectSchema.parse(data)
    try {
      const newLead = await prisma.lead.create({
        data: lead
      });
      return c.json(newLead, 201);
    } catch (error) {
      console.error("Error in createNewCustomer", error);
      return c.json({ error: "Failed to create customer" }, 500);
    }
  })
  .put("/:id", async (c) => {
    const id = c.req.param("id");
    const { nombre, apellido_paterno, apellido_materno, email, telefono, dni } =
      await c.req.json();

    if (!id || typeof id !== "string") {
      return c.json({ error: "Invalid customer ID" }, 400);
    }

   
  });
