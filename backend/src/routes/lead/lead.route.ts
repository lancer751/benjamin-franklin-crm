// routes/lead.route.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import type { SuccessResponse } from "@/app";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  CreateCampaignMemberSchema,
  UpdateCampaignMemberStatusSchema,
  ReassignCampaignMemberSchema,
  CreateLeadInteractionSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  LeadQuerySchema,
  CampaignMemberQuerySchema,
  ReassignMultipleCampaignMembersSchema,
} from "shared";
import { leadRepository } from "@/repositories/lead.repository";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";

const UUIDParam = z.object({ id: z.string().uuid().length(36) });
const MemberParam = z.object({ memberId: z.string().uuid().length(36) });
const TaskParam = z.object({
  memberId: z.uuid().length(36),
  taskId: z.uuid().length(36),
});

function handleRepoError(err: unknown): never {
  if (err && typeof err === "object" && "code" in err) {
    const e = err as { code: string; message: string };
    const statusMap: Record<string, 400 | 404 | 409 | 422> = {
      NOT_FOUND: 404,
      CONFLICT: 409,
      INVALID: 422,
    };
    throw new HTTPException(statusMap[e.code] ?? 400, { message: e.message });
  }
  throw err;
}

// ── /leads ───────────────────────────────────────────────────────────────────
export const leadRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
  )
  .get("/", zValidator("query", LeadQuerySchema), async (c) => {
    const repo = leadRepository(c.get("prisma"));
    const result = await repo.findMany(c.req.valid("query"));
    return c.json<SuccessResponse<typeof result>>(
      { success: true, message: "Leads retrieved", data: result },
      200,
    );
  })

  .get("/:id", zValidator("param", UUIDParam), async (c) => {
    const { id } = c.req.valid("param");
    const repo = leadRepository(c.get("prisma"));
    const lead = await repo.findById(id);
    if (!lead) throw new HTTPException(404, { message: "Lead not found" });
    return c.json<SuccessResponse<typeof lead>>(
      { success: true, message: "Lead retrieved", data: lead },
      200,
    );
  })

  .post(
    "/",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("json", CreateLeadSchema),
    async (c) => {
      const repo = leadRepository(c.get("prisma"));
      try {
        const lead = await repo.create(c.req.valid("json"));
        return c.json<SuccessResponse<typeof lead>>(
          { success: true, message: "Lead created", data: lead },
          201,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )

  .put(
    "/:id",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", UUIDParam),
    zValidator("json", UpdateLeadSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      try {
        const lead = await repo.update(id, c.req.valid("json"));
        return c.json<SuccessResponse<typeof lead>>(
          { success: true, message: "Lead updated", data: lead },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  );

// ACTIONS WITH THE LEADS ON CAMPAIGNS
// ── /campaigns/:id/members ────────────────────────────────────────────────────
export const campaignMemberRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
  )
  // GET all members of a campaign
  .get(
    "/",
    zValidator("param", z.object({ campaignId: z.uuid().length(36) })),
    zValidator("query", CampaignMemberQuerySchema),
    async (c) => {
      const { campaignId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      const result = await repo.findMembersByMember(
        campaignId,
        c.req.valid("query"),
      );
      return c.json<SuccessResponse<typeof result>>(
        { success: true, message: "Members retrieved", data: result },
        200,
      );
    },
  )

  // POST — add a lead to a campaign (creates CampaignMember)
  .post(
    "/",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("json", CreateCampaignMemberSchema),
    async (c) => {
      const repo = leadRepository(c.get("prisma"));
      try {
        const member = await repo.createMember(c.req.valid("json"));
        return c.json<SuccessResponse<typeof member>>(
          { success: true, message: "Lead added to campaign", data: member },
          201,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )

  // PATCH /:memberId/status — update CampaignMemberStatus
  .patch(
    "/:memberId/status",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", MemberParam),
    zValidator("json", UpdateCampaignMemberStatusSchema),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      const updated = await repo.updateMemberStatus(
        memberId,
        c.req.valid("json"),
      );
      return c.json<SuccessResponse<typeof updated>>(
        { success: true, message: "Status updated", data: updated },
        200,
      );
    },
  )

  // PATCH /:memberId/reassign — reassign lead to another seller
  .patch(
    "/:memberId/reassign",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", MemberParam),
    zValidator("json", ReassignCampaignMemberSchema),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      try {
        const updated = await repo.reassignMember(
          memberId,
          c.req.valid("json"),
        );
        return c.json<SuccessResponse<typeof updated>>(
          { success: true, message: "Lead reassigned", data: updated },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )
  // PATCH /members/reassign-bulk — reassign multiple leads to a seller
.patch(
  "/reassign-bulk",
  verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_SUPERVISOR"),
  zValidator("json", ReassignMultipleCampaignMembersSchema),
  async (c) => {
    const repo = leadRepository(c.get("prisma"));
    try {
      const updated = await repo.reassignMembersBeforeRemove(c.req.valid("json"));
      return c.json<SuccessResponse<typeof updated>>(
        {
          success: true,
          message: `${updated.length} lead(s) reassigned`,
          data: updated,
        },
        200,
      );
    } catch (err) {
      handleRepoError(err);
    }
  },
)
  // ── Interactions under a member ────────────────────────────────────────────
  // GET /:memberId/interactions
  .get(
    "/:memberId/interactions",
    zValidator("param", MemberParam),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      const interactions = await repo.findInteractions(memberId);
      return c.json<SuccessResponse<typeof interactions>>(
        {
          success: true,
          message: "Interactions retrieved",
          data: interactions,
        },
        200,
      );
    },
  )

  // POST /:memberId/interactions
  .post(
    "/:memberId/interactions",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "MARKETING", "SALES_SUPERVISOR"),
    zValidator("param", MemberParam),
    zValidator("json", CreateLeadInteractionSchema),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      // For MVP sellerId comes from the request — swap for JWT claim in v2
      const sellerId = c.req.header("x-seller-id") ?? "";
      try {
        const interaction = await repo.createInteraction(
          memberId,
          sellerId,
          c.req.valid("json"),
        );
        return c.json<SuccessResponse<typeof interaction>>(
          { success: true, message: "Interaction logged", data: interaction },
          201,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )

  // ── Tasks under a member ───────────────────────────────────────────────────
  // GET /:memberId/tasks
  .get("/:memberId/tasks", zValidator("param", MemberParam), async (c) => {
    const { memberId } = c.req.valid("param");
    const repo = leadRepository(c.get("prisma"));
    const tasks = await repo.findTasks(memberId);
    return c.json<SuccessResponse<typeof tasks>>(
      { success: true, message: "Tasks retrieved", data: tasks },
      200,
    );
  })

  // POST /:memberId/tasks
  .post(
    "/:memberId/tasks",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "MARKETING", "SALES_SUPERVISOR"),
    zValidator("param", MemberParam),
    zValidator("json", CreateTaskSchema),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      const sellerId = c.req.header("x-seller-id") ?? "";
      try {
        const task = await repo.createTask(
          memberId,
          sellerId,
          c.req.valid("json"),
        );
        return c.json<SuccessResponse<typeof task>>(
          { success: true, message: "Task created", data: task },
          201,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )

  // PATCH /:memberId/tasks/:taskId
  .patch(
    "/:memberId/tasks/:taskId",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", TaskParam),
    zValidator("json", UpdateTaskSchema),
    async (c) => {
      const { taskId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      const task = await repo.updateTask(taskId, c.req.valid("json"));
      return c.json<SuccessResponse<typeof task>>(
        { success: true, message: "Task updated", data: task },
        200,
      );
    },
  )

  // DELETE /:memberId/tasks/:taskId
  .delete(
    "/:memberId/tasks/:taskId",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", TaskParam),
    async (c) => {
      const { taskId } = c.req.valid("param");
      const repo = leadRepository(c.get("prisma"));
      await repo.deleteTask(taskId);
      return c.json<SuccessResponse>(
        { success: true, message: "Task deleted" },
        200,
      );
    },
  );
