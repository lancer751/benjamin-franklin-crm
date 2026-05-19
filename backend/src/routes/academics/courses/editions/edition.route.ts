import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@repo/database";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  CreateRefinedEditionSchema,
  UpdateEditionSchema,
  type ErrorResponse,
} from "shared";
import { z } from "zod";

export const editionRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const courseEditions = await c.get("prisma").edition.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
            image_url: true,
            code: true,
          },
        },
        schedules: {
          include: { slots: true },
        },
        assigned_professors: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: courseEditions,
      },
      200,
    );
  })
  .get(
    UUID_ROUTE,

    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const courseEdition = await c.get("prisma").edition.findUnique({
        where: { id },
        include: {
          course: true,
          schedules: {
            include: {
              slots: true,
            },
          },
          assigned_professors: true,
        },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      return c.json<SuccessResponse<typeof courseEdition>>(
        {
          success: true,
          message: "Course edition retrieved successfully",
          data: courseEdition,
        },
        200,
      );
    },
  )
  // Create new edition
  .post("/", zValidator("json", CreateRefinedEditionSchema), async (c) => {
    const { assigned_professors, schedules, course_id, ...editionFields } =
      c.req.valid("json");

    const prisma = c.get("prisma");

    // ── Verify the course exists before opening a transaction ──────────────────
    const courseExists = await prisma.course.findUnique({
      where: { id: course_id },
      select: { id: true },
    });

    if (!courseExists) {
      return c.json<ErrorResponse>(
        { success: false, error: `Course with id "${course_id}" not found` },
        404,
      );
    }

    // ── Verify all professors exist ────────────────────────────────────────────
    const professorIds = assigned_professors.map((p) => p.professor_id);

    const foundProfessors = await prisma.professor.findMany({
      where: { id: { in: professorIds } },
      select: { id: true },
    });

    if (foundProfessors.length !== professorIds.length) {
      const foundIds = new Set(foundProfessors.map((p) => p.id));
      const missing = professorIds.filter((id) => !foundIds.has(id));

      return c.json<ErrorResponse>(
        {
          success: false,
          error: `The following professor IDs were not found: ${missing.join(", ")}`,
        },
        404,
      );
    }

    // ── Transaction: edition + schedules + slots + professors ─────────────────
    try {
      const newEdition = await prisma.$transaction(async (tx) => {
        const created = await tx.edition.create({
          data: {
            ...editionFields,
            course_id,
            // Each schedule needs nested slot creates — createMany doesn't
            // support nested relations, so we use create with a nested array
            schedules: {
              create: schedules.map(({ slots, ...scheduleFields }) => ({
                ...scheduleFields,
                slots: {
                  create: slots, // { start_time, end_time }[]
                },
              })),
            },
          },
        });

        // Professors join table — safe to createMany here because there are no
        // further nested relations to write
        await tx.proffessorsOnEditions.createMany({
          data: professorIds.map((professor_id) => ({
            professor_id,
            edition_id: created.id,
          })),
        });

        return tx.edition.findUniqueOrThrow({
          where: { id: created.id },
          include: {
            course: { select: { id: true, name: true, code: true } },
            schedules: { include: { slots: true } },
            assigned_professors: {
              include: {
                professors: {
                  select: { id: true, name: true, lastname: true },
                },
              },
            },
          },
        });
      });

      return c.json<SuccessResponse<typeof newEdition>>(
        {
          success: true,
          message: "Course edition created successfully",
          data: newEdition,
        },
        201,
      );
    } catch (error) {
      // Unique constraint — most likely a duplicate edition_code
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const field = (error.meta?.target as string[])?.join(", ") ?? "field";
          return c.json<ErrorResponse>(
            {
              success: false,
              error: `An edition with this ${field} already exists`,
            },
            409,
          );
        }

        // FK violation — references a record that doesn't exist
        if (error.code === "P2003") {
          return c.json<ErrorResponse>(
            { success: false, error: "A referenced record does not exist" },
            422,
          );
        }
      }

      throw error; // let your global error handler deal with unexpected errors
    }
  })
  // Update edition
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    zValidator("json", UpdateEditionSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const {
        assigned_professors: incomingProfessors,
        schedules: incomingSchedules,
        course_id,
        ...plainFields
      } = c.req.valid("json");

      const prisma = c.get("prisma");

      // ── Verify edition exists ──────────────────────────────────────────────
      const existing = await prisma.edition.findUnique({
        where: { id },
        select: {
          id: true,
          edition_code: true,
          moodle_course_id: true,
        },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      // ── Unique conflict checks (only when the value is actually changing) ──
      if (
        plainFields.moodle_course_id != null &&
        plainFields.moodle_course_id !== existing.moodle_course_id
      ) {
        const moodleConflict = await prisma.edition.findUnique({
          where: { moodle_course_id: plainFields.moodle_course_id },
          select: { edition_code: true },
        });
        if (moodleConflict) {
          return c.json<ErrorResponse>(
            {
              success: false,
              error: `moodle_course_id ${plainFields.moodle_course_id} is already linked to edition "${moodleConflict.edition_code}"`,
            },
            409,
          );
        }
      }

      if (
        plainFields.edition_code != null &&
        plainFields.edition_code !== existing.edition_code
      ) {
        const codeConflict = await prisma.edition.findUnique({
          where: { edition_code: plainFields.edition_code },
          select: { id: true },
        });
        if (codeConflict) {
          return c.json<ErrorResponse>(
            {
              success: false,
              error: `Edition code "${plainFields.edition_code}" is already in use`,
            },
            409,
          );
        }
      }

      // ── Validate incoming professor IDs exist ──────────────────────────────
      if (incomingProfessors?.length) {
        const professorIds = incomingProfessors.map((p) => p.professor_id);
        const found = await prisma.professor.findMany({
          where: { id: { in: professorIds } },
          select: { id: true },
        });
        if (found.length !== professorIds.length) {
          const foundIds = new Set(found.map((p) => p.id));
          const missing = professorIds.filter((pid) => !foundIds.has(pid));
          return c.json<ErrorResponse>(
            {
              success: false,
              error: `Professor IDs not found: ${missing.join(", ")}`,
            },
            404,
          );
        }
      }

      // ── Transaction ────────────────────────────────────────────────────────
      try {
        const updatedEdition = await prisma.$transaction(async (tx) => {
          // 1. Update scalar fields (course_id reconnect if provided)
          await tx.edition.update({
            where: { id },
            data: {
              ...plainFields,
              ...(course_id && { course: { connect: { id: course_id } } }),
            },
          });

          // 2. Replace professors — delete all then re-insert
          //    "Replace" is correct here: the join table has no extra data to
          //    preserve, and a diff-based approach would need 2 extra queries
          //    with no real benefit for a small list.
          if (incomingProfessors !== undefined) {
            await tx.proffessorsOnEditions.deleteMany({
              where: { edition_id: id },
            });

            if (incomingProfessors.length > 0) {
              await tx.proffessorsOnEditions.createMany({
                data: incomingProfessors.map(({ professor_id }) => ({
                  professor_id,
                  edition_id: id,
                })),
              });
            }
          }

          // 3. Replace schedules + slots — delete cascade handles slots
          //    (EditionScheduleSlot has onDelete: Cascade on schedule_id)
          if (incomingSchedules !== undefined) {
            await tx.editionSchedule.deleteMany({
              where: { edition_id: id },
            });

            if (incomingSchedules.length > 0) {
              for (const { slots, ...scheduleFields } of incomingSchedules) {
                await tx.editionSchedule.create({
                  data: {
                    ...scheduleFields,
                    edition_id: id,
                    slots: { create: slots },
                  },
                });
              }
            }
          }

          // 4. Return the full updated record
          return tx.edition.findUniqueOrThrow({
            where: { id },
            include: {
              course: { select: { id: true, name: true, code: true } },
              schedules: { include: { slots: true } },
              assigned_professors: {
                include: {
                  professors: {
                    select: { id: true, name: true, lastname: true },
                  },
                },
              },
            },
          });
        });

        return c.json<SuccessResponse<typeof updatedEdition>>(
          {
            success: true,
            message: "Course edition updated successfully",
            data: updatedEdition,
          },
          200,
        );
      } catch (error) {
        if (
          error != null &&
          typeof error === "object" &&
          "code" in error &&
          "clientVersion" in error
        ) {
          const { code, meta } = error as {
            code: string;
            meta?: { target?: string[] };
          };

          if (code === "P2002") {
            const field = meta?.target?.join(", ") ?? "field";
            return c.json<ErrorResponse>(
              {
                success: false,
                error: `Unique constraint violated on: ${field}`,
              },
              409,
            );
          }

          if (code === "P2003") {
            return c.json<ErrorResponse>(
              { success: false, error: "A referenced record does not exist" },
              422,
            );
          }
        }

        throw error;
      }
    },
  )

  // Delete edition
  .delete(
    UUID_ROUTE,

    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existingEdition = await c.get("prisma").edition.findUnique({
        where: { id },
        include: {
          schedules: true,
        },
      });

      if (!existingEdition) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      // this must be in products
      // Prevent deletion if edition has campaign or schedules
      // if (existingEdition.campaing || existingEdition.schedules.length > 0) {
      //   throw new HTTPException(400, {
      //     message: "Cannot delete edition that has associated campaigns or schedules",
      //   });
      // }

      await c.get("prisma").edition.delete({ where: { id } });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Course edition deleted successfully",
        },
        200,
      );
    },
  );