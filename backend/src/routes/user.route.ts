import { Hono } from "hono";
import prisma from "../lib/prisma";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const userSchema = z.object({
  id: z.uuid(),
  nombre: z.string().max(50),
  apellido_paterno: z.string().max(20),
  apellido_materno: z.string().max(20).optional(),
  email: z.email(),
  telefono: z
    .string()
    .length(9)
    .regex(/^9\d{8}$/, "Invalid Peruvian phone number")
    .optional(),
  role_id: z.uuid(),
  is_active: z.boolean(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userRoutes = new Hono()
  .get("/", async (c) => {
    try {
      const users = await prisma.usuario.findMany({
        select: {
          id: true,
          apellido_materno: true,
          apellido_paterno: true,
          nombre: true,
          email: true,
          telefono: true,
          role: true,
        },
      });
      c.status(200);
      return c.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      c.status(500);
      return c.json({ error: "Failed to fetch users" });
    }
  })
  .get(
    "/:id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}",
    async (c) => {
      const userId = c.req.param("id");
      try {
        const user = await prisma.usuario.findUnique({
          where: { id: userId },
          select: {
            id: true,
            apellido_materno: true,
            apellido_paterno: true,
            nombre: true,
            email: true,
            telefono: true,
            role: {
              select: { nombre: true },
            },
          },
        });
        if (!user) {
          c.status(404);
          return c.json({ error: "User not found" });
        }

        return c.json(user);
      } catch (error) {
        console.error(`Error fetching user with id ${userId}:`, error);
        c.status(500);
        return c.json({ error: "Failed to fetch user" });
      }
    },
  )
  .get("/:id", (c) => {
    const id = c.req.param("id");

    c.status(400);
    return c.json({
      error: "Invalid user ID format",
      message: "Expected UUID",
      received: id,
    });
  })
  .post("/", zValidator("json", createUserSchema), async (c) => {
    const data = await c.req.valid("json");

    const user = createUserSchema.parse(data);

    try {
      const newUser = await prisma.usuario.create({
        data: user,
        select: {
          id: true,
          apellido_materno: true,
          apellido_paterno: true,
          nombre: true,
          email: true,
          telefono: true,
          role: {
            select: { nombre: true },
          },
        },
      });
      c.status(201);
      return c.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      c.status(500);
      return c.json({ error: "Failed to create user" });
    }
  })
  .put(
    "/:id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}",
    async (c) => {
      return c.json({});
    },
  );
