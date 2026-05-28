import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { BaseCreateProfessorSchema, UpdateProfessorSchema } from "shared";

export const professorRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserRoleAccess("ADMIN"))
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const professors = await prisma.professor.findMany();

    return c.json<SuccessResponse<typeof professors>>(
      {
        message: "Data retrieved Successfully",
        data: professors,
        success: true,
      },
      200,
    );
  })
  .get(UUID_ROUTE, zValidator("param", validateIdParamSchema), async (c) => {
    const prisma = c.get("prisma");
    const { id } = c.req.valid("param");

    const professorProfile = await prisma.professor.findUnique({
      where: { id },
      include: {
        assigned_editions: {
          select: {
            edition_id: true,
            editions: {
              select: {
                course: {
                  select: { name: true },
                },
                edition_code: true,
                edition_number: true,
              },
            },
          },
        },
      },
    });
    if (!professorProfile) {
      throw new HTTPException(404, { message: "Professor not found" });
    }

    const clon = structuredClone(professorProfile);
    const formattedProfessorProfile = {
      ...clon,
      assigned_editions: clon.assigned_editions.map(
        ({ edition_id, editions }) => ({
          edition_id,
          ...editions,
        }),
      ),
    };

    return c.json(formattedProfessorProfile, 200);
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

    return c.json<SuccessResponse<typeof newProfessor>>({
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
      const { id } = c.req.valid("param");
      const professorData = c.req.valid("json");

      //Verify professor exists 
      const existing = await prisma.professor.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          cellphone: true,
          moddle_account_id: true,
        },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Professor not found" });
      }

      // Unique conflict checks (only when the value actually changes) 
      if (professorData.email && professorData.email !== existing.email) {
        const conflict = await prisma.professor.findUnique({
          where: { email: professorData.email },
          select: { id: true },
        });
        if (conflict) {
          throw new HTTPException(409, {
            message: `Email "${professorData.email}" is already registered to another professor`,
          });
        }
      }

      if (
        professorData.cellphone &&
        professorData.cellphone !== existing.cellphone
      ) {
        const conflict = await prisma.professor.findUnique({
          where: { cellphone: professorData.cellphone },
          select: { id: true },
        });
        if (conflict) {
          throw new HTTPException(409, {
            message: `Cellphone "${professorData.cellphone}" is already registered to another professor`,
          });
        }
      }

      if (
        professorData.moddle_account_id !== undefined &&
        professorData.moddle_account_id !== existing.moddle_account_id
      ) {
        const conflict = await prisma.professor.findUnique({
          where: { moddle_account_id: professorData.moddle_account_id },
          select: { id: true },
        });
        if (conflict) {
          throw new HTTPException(409, {
            message: `Moodle account ID ${professorData.moddle_account_id} is already linked to another professor`,
          });
        }
      }

      const updatedProfessor = await prisma.professor.update({
        where: { id },
        data: professorData,
      });

      return c.json<SuccessResponse<typeof updatedProfessor>>(
        {
          message: "Professor updated successfully",
          success: true,
          data: updatedProfessor,
        },
        200,
      );
    },
  )
  .delete(UUID_ROUTE, zValidator("param", validateIdParamSchema), async (c) => {
    const prisma = c.get("prisma");
    const { id } = c.req.valid("param");

    // ── 1. Verify professor exists ─────────────────────────────────────────
    const existing = await prisma.professor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        assigned_editions: {
          select: {
            edition_id: true,
            editions: {
              select: {
                edition_status: true,
                edition_code: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new HTTPException(404, { message: "Professor not found" });
    }

    if (existing.assigned_editions.length > 0) {
      throw new HTTPException(409, {
        message: `Cannot delete professor assigned to ${existing.assigned_editions.length} edition(s). Unassign them first.`,
      });
    }

    await prisma.professor.delete({
      where: { id },
    });

    return c.json<SuccessResponse>(
      {
        success: true,
        message: `Professor "${existing.name} ${existing.lastname}" has been deleted successfully.`,
      },
      200,
    );
  })
  // Desactivate professor (soft delete) - sets is_active to false and moodle_user_status to SUSPENDED
  .patch(
    `${UUID_ROUTE}/desactivate`,
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id } = c.req.valid("param");

      const existing = await prisma.professor.findUnique({
        where: { id },
        select: { id: true, name: true, lastname: true, is_active: true },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Professor not found" });
      }

      if (!existing.is_active) {
        throw new HTTPException(409, {
          message: "Professor is already deactivated",
        });
      }

      const desactivated = await prisma.professor.update({
        where: { id },
        data: {
          is_active: false,
          moodle_user_status: "SUSPENDED",
        },
      });

      return c.json<SuccessResponse<typeof desactivated>>(
        {
          success: true,
          message: `Professor "${existing.name} ${existing.lastname}" has been deactivated`,
          data: desactivated,
        },
        200,
      );
    },
  )
  // Restore professor (undo soft delete) - sets is_active to true and moodle_user_status to ACTIVE
  .patch(
    `${UUID_ROUTE}/restore`,
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id } = c.req.valid("param");

      const existing = await prisma.professor.findUnique({
        where: { id },
        select: { id: true, name: true, lastname: true, is_active: true },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Professor not found" });
      }

      if (existing.is_active) {
        throw new HTTPException(409, {
          message: "Professor is already active",
        });
      }

      const restored = await prisma.professor.update({
        where: { id },
        data: {
          is_active: true,
          moodle_user_status: "ACTIVE",
        },
      });

      return c.json<SuccessResponse<typeof restored>>(
        {
          success: true,
          message: `Professor "${existing.name} ${existing.lastname}" has been restored`,
          data: restored,
        },
        200,
      );
    },
  );
