import { Hono } from "hono";
import prisma from "../lib/prisma";
import { UUID_ROUTE } from "@/helpers/constants";
import { handleError } from "@/helpers/errorHandling";

export const userRoutes = new Hono()
  .get("/", async (c) => {
    try {
      const users = await prisma.user.findMany({
        omit: {
          password: true,
        },
      });
      return c.json(users, 200);
    } catch (error) {
      handleError(c, error, "Error while getting users");
    }
  })
  .get(UUID_ROUTE, async (c) => {
    const id = c.req.param("id");

    try {
      const user = await prisma.user.findUniqueOrThrow({ where: { id } });
      if (!user) {
        return c.json({ error: "User don't found" }, 404);
      }
      return c.json(user);
    } catch (error) {
      handleError(c, error, "Error while getting user profile");
    }
  });
