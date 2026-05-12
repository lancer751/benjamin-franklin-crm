import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { BaseCreateProfessorSchema, UpdateProfessorSchema } from "shared";

export const professorRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const professors = await prisma.professor.findMany();

    c.json(professors, 200);
  })
  .post("/", zValidator("json", BaseCreateProfessorSchema), async (c) => {
    const prisma = c.get("prisma");
    const professorData = c.req.valid("json");

    const existingProfessor = await prisma.professor.findUnique({
      where: { email: professorData.email },
    });

    if (existingProfessor) {
      throw new HTTPException(404, { message: "Professor not found" });
    }

    const newProfessor = await prisma.professor.create({
      data: professorData,
    });

    c.json<SuccessResponse<typeof newProfessor>>({
      message: "Professor created Successfully",
      success: true,
      data: newProfessor,
    });
  })
  .put(
    UUID_ROUTE,
    zValidator("param", validateIdParamSchema),
    zValidator("json", UpdateProfessorSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const professorData = c.req.valid("json");
      const { id: professorId } = c.req.valid("param");

      const existingProfessor = await prisma.professor.findUnique({
        where: { email: professorData.email },
      });

      if (existingProfessor) {
        throw new HTTPException(404, { message: "Professor not found" });
      }

      const updatedProfessor = await prisma.professor.update({
        where: { id: professorId },
        data: professorData,
      });

      c.json<SuccessResponse<typeof updatedProfessor>>({
        message: "Professor updated Successfully",
        success: true,
        data: updatedProfessor,
      });
    },
  );
