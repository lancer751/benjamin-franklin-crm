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

      // ── 1. Verify professor exists and isn't deleted ───────────────────────
      const existing = await prisma.professor.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          cellphone: true,
          moddle_account_id: true,
          deleted_at: true,
        },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Professor not found" });
      }

      if (existing.deleted_at !== null) {
        throw new HTTPException(409, {
          message: "Cannot update a deleted professor. Restore them first.",
        });
      }

      // ── 2. Unique conflict checks (only when the value actually changes) ───
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

      // ── 3. Warn if trying to reactivate via PUT instead of the restore endpoint
      // moodle_user_status changes are allowed but suspension should go
      // through DELETE and restoration through PATCH /:id/restore for clarity

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
        deleted_at: true,
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

    if (existing.deleted_at !== null) {
      throw new HTTPException(409, {
        message: "Professor is already deleted",
      });
    }

    // ── 2. Check for blocking active assignments ───────────────────────────
    const BLOCKING_STATUSES = ["IN_PROGRESS", "OPEN"] as const;

    const blockingEditions = existing.assigned_editions.filter(({ editions }) =>
      BLOCKING_STATUSES.includes(
        editions.edition_status as (typeof BLOCKING_STATUSES)[number],
      ),
    );

    if (blockingEditions.length > 0) {
      const codes = blockingEditions
        .map((e) => e.editions.edition_code)
        .join(", ");
      throw new HTTPException(409, {
        message: `Cannot deactivate professor "${existing.name} ${existing.lastname}" — they are assigned to active or open editions: ${codes}. Reassign those editions first.`,
      });
    }

    // ── 3. Transaction: unassign from future editions + soft delete ────────
    const REMOVABLE_STATUSES = ["DRAFT", "SCHEDULED"] as const;

    const removableEditionIds = existing.assigned_editions
      .filter(({ editions }) =>
        REMOVABLE_STATUSES.includes(
          editions.edition_status as (typeof REMOVABLE_STATUSES)[number],
        ),
      )
      .map((e) => e.edition_id);

    await prisma.$transaction(async (tx) => {
      // Remove from editions that haven't started yet
      if (removableEditionIds.length > 0) {
        await tx.proffessorsOnEditions.deleteMany({
          where: {
            professor_id: id,
            edition_id: { in: removableEditionIds },
          },
        });
      }

      // Soft delete
      await tx.professor.update({
        where: { id },
        data: {
          is_active: false,
          moodle_user_status: "SUSPENDED",
          deleted_at: new Date(),
        },
      });
    });

    return c.json<SuccessResponse>(
      {
        success: true,
        message: `Professor "${existing.name} ${existing.lastname}" has been deactivated and removed from ${removableEditionIds.length} upcoming edition(s)`,
      },
      200,
    );
  })
  // Restores a soft-deleted professor back to active status
  .patch(
    `${UUID_ROUTE}/restore`,
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id } = c.req.valid("param");

      const existing = await prisma.professor.findUnique({
        where: { id },
        select: { id: true, name: true, lastname: true, deleted_at: true },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Professor not found" });
      }

      if (existing.deleted_at === null) {
        throw new HTTPException(409, {
          message: "Professor is already active",
        });
      }

      const restored = await prisma.professor.update({
        where: { id },
        data: {
          is_active: true,
          moodle_user_status: "ACTIVE",
          deleted_at: null,
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
