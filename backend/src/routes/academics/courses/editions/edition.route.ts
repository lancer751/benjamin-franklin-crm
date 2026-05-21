import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateRefinedEditionSchema, UpdateEditionSchema } from "shared";
import { z } from "zod";

export const editionRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"))
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
          assigned_professors: {
            select: {
              professors: {
                select: {
                  id: true,
                  name: true,
                  lastname: true,
                  email: true,
                  corporate_email: true,
                  is_active: true,
                  cellphone: true
                },
              },
            },
          },
        },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      const formattedData = {
        ...courseEdition,
        assigned_professors: courseEdition.assigned_professors.map(
          (prof) => prof.professors,
        ),
      };

      return c.json<SuccessResponse<typeof formattedData>>(
        {
          success: true,
          message: "Course edition retrieved successfully",
          data: formattedData,
        },
        200,
      );
    },
  )
  // TODO: Avoid many concurrent request to the database
  .post(
    "/",
    verifyUserRoleAccess("ADMIN"),
    zValidator("json", CreateRefinedEditionSchema),
    async (c) => {
      const { assigned_professors, schedules, course_id, ...editionFields } =
        c.req.valid("json");

      const prisma = c.get("prisma");

      //  Verify the course exists before opening a transaction
      const courseExists = await prisma.course.findUnique({
        where: { id: course_id },
        select: { id: true },
      });

      if (!courseExists) {
        throw new HTTPException(404, {
          message: `Course with id "${course_id}" not found`,
        });
      }

      //  Verify all professors exist
      const professorIds = assigned_professors.map((p) => p.professor_id);

      const foundProfessorsIds = await prisma.professor.findMany({
        where: { id: { in: professorIds } },
        select: { id: true },
      });

      if (foundProfessorsIds.length !== professorIds.length) {
        const foundIds = new Set(foundProfessorsIds.map((p) => p.id));
        const missing = professorIds.filter((id) => !foundIds.has(id));

        throw new HTTPException(404, {
          message: `The following professor IDs were not found: ${missing.join(", ")}`,
        });
      }
      //  Transaction: edition + schedules + slots + professors
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
    },
  )
  // TODO: Avoid many concurrent request to the database
  .put(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN"),
    zValidator("param", z.object({ id: z.uuid().length(36) })),
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

      // ── 1. Verify edition exists
      const existing = await prisma.edition.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      // ── 2. Unique conflict checks (only when the value actually changes) ───
      if (
        plainFields.moodle_course_id !== null &&
        plainFields.moodle_course_id !== existing.moodle_course_id
      ) {
        const conflict = await prisma.edition.findUnique({
          where: { moodle_course_id: plainFields.moodle_course_id },
          select: { edition_code: true },
        });
        if (conflict) {
          throw new HTTPException(409, {
            message: `moodle_course_id ${plainFields.moodle_course_id} is already linked to edition "${conflict.edition_code}"`,
          });
        }
      }

      // ── 3. Validate incoming professor IDs
      let professorIds: string[] = [];
      if (incomingProfessors?.length) {
        professorIds = incomingProfessors.map((p) => p.professor_id);
        const found = await prisma.professor.findMany({
          where: { id: { in: professorIds } },
          select: { id: true },
        });
        if (found.length !== professorIds.length) {
          const foundIds = new Set(found.map((p) => p.id));
          const missing = professorIds.filter((pid) => !foundIds.has(pid));
          throw new HTTPException(404, {
            message: `Professor IDs not found: ${missing.join(", ")}`,
          });
        }
      }

      // ── 4. Transaction
      // All pre-flight checks are done above — the transaction is kept as
      // short and linear as possible to avoid concurrent query warnings from
      // the pg adapter (it uses one connection per transaction).
      const updatedEdition = await prisma.$transaction(async (tx) => {
        // 4a. Scalar fields + optional course reconnect
        await tx.edition.update({
          where: { id },
          data: {
            ...plainFields,
            ...(course_id && { course: { connect: { id: course_id } } }),
          },
        });

        // 4b. Replace professors (join table — no extra data to preserve)
        if (incomingProfessors !== undefined) {
          await tx.proffessorsOnEditions.deleteMany({
            where: { edition_id: id },
          });

          if (professorIds.length > 0) {
            await tx.proffessorsOnEditions.createMany({
              data: professorIds.map((professor_id) => ({
                professor_id,
                edition_id: id,
              })),
            });
          }
        }

        // 4c. Replace schedules + slots
        //     Sequential awaits (not Promise.all) — the pg adapter uses a
        //     single connection per transaction and doesn't support concurrent
        //     queries on the same connection.
        if (incomingSchedules !== undefined) {
          // Cascade delete on EditionScheduleSlot.schedule_id handles slots
          await tx.editionSchedule.deleteMany({ where: { edition_id: id } });

          for (const { slots, ...scheduleFields } of incomingSchedules) {
            // Create the schedule first, then batch-insert its slots
            const schedule = await tx.editionSchedule.create({
              data: { ...scheduleFields, edition_id: id },
            });

            if (slots.length > 0) {
              await tx.editionScheduleSlot.createMany({
                data: slots.map((slot) => ({
                  ...slot,
                  schedule_id: schedule.id,
                })),
              });
            }
          }
        }

        // 4d. Fetch and return the full updated record
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
    },
  )
  .delete(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN"),
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const prisma = c.get("prisma");
      const existing = await prisma.edition.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      await prisma.$transaction([
        prisma.proffessorsOnEditions.deleteMany({ where: { edition_id: id } }),
        prisma.editionSchedule.deleteMany({ where: { edition_id: id } }),
        prisma.edition.delete({ where: { id } }),
      ]);

      return c.json<SuccessResponse>(
        {
          success: true,
          message: `Edition "${existing.edition_code}" deleted successfully`,
        },
        200,
      );
    },
  );