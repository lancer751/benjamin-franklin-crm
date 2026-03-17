import { Hono } from "hono";
import prisma from "../lib/prisma";

export const customerRoutes = new Hono()
  .get("/", async (c) => {
    try {
      const customers = await prisma.cliente.findMany({
        select: {
          id: true,
          apellido_materno: true,
          apellido_paterno: true,
          nombre: true,
          email: true,
          telefono: true,
          dni: true,
          moodle_user_id: true,
          credentials_sent: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return c.json(customers, 200);
    } catch (error) {
      console.error("Error fetching customers:", error);
      return c.json({ error: "Failed to fetch customers" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    if (!id || typeof id !== "string") {
      return c.json({ error: "Invalid customer ID" }, 400);
    }

    try {
      const customer = await prisma.cliente.findUnique({
        where: { id },
      });

      if (!customer) {
        return c.json({ error: "Customer not found" }, 404);
      }
      return c.json(customer, 200);
    } catch (error) {
      console.error("Error fetching customer:", error);
      return c.json({ error: "Failed to fetch customer" }, 500);
    }
  })
  .post("/", async (c) => {
    const { nombre, apellido_paterno, apellido_materno, email, telefono, dni } =
      await c.req.json();

    try {
      const newCustomer = await prisma.cliente.create({
        data: {
          nombre,
          apellido_paterno,
          apellido_materno,
          email,
          telefono,
          dni,
        },
      });
      return c.json(newCustomer, 201);
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

    try {
      const updatedCustomer = await prisma.cliente.update({
        where: { id },
        data: {
          nombre,
          apellido_paterno,
          apellido_materno,
          email,
          telefono,
          dni,
        },
      });
      return c.json(updatedCustomer, 200);
    } catch (error) {
      console.error("Error updating customer:", error);
      return c.json({ error: "Failed to update customer" }, 500);
    }
  });
