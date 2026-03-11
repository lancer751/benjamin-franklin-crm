import { Hono } from "hono";
import prisma from "../lib/prisma";
import z from "zod";

// router.get("/", getAllUsers)
// router.get("/:id", getUserById)
// router.post("/", createUser)
// router.put("/:id", updateUser)

// export default router;
const userSchema = z.object({
    id: z.uuid(),      
  nombre: z.string().max(50),
  apellido_paterno: z.string().max(20),
  apellido_materno: z.string().max(20),
  email: z.email(),
  telefono: z.number().sta
  role_id          
  is_active       
  password         

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
});

const createUserSchema = z.object({});

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
  .post("/", async (c) => {
    return c.json({});
  })
  .put(
    "/:id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}",
    async (c) => {
      return c.json({});
    },
  );
