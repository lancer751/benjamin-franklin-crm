import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  MarketingReportQuerySchema,
  SalesReportQuerySchema,
  CollectionsReportQuerySchema,
  MetaReportQuerySchema,
} from "shared";
import { verifyUserAccessAuth, verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { reportRepository } from "@/repositories/report.repository";
import type { SuccessResponse } from "@/app";
import { handleRepoError } from "./lead/lead.route";

export const reportRoutes = new Hono<ContextWithPrisma>()
  .use(verifyUserAccessAuth) // aplica a nivel de grupo — evita repetirlo por ruta
  .get(
    "/marketing",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_SUPERVISOR"),
    zValidator("query", MarketingReportQuerySchema),
    async (c) => {
      const repo = reportRepository(c.get("prisma"));
      try {
        const report = await repo.marketing(c.req.valid("query"));
        return c.json<SuccessResponse<typeof report>>(
          { success: true, message: "Marketing report generated", data: report },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )
  .get(
    "/sales",
    verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"),
    zValidator("query", SalesReportQuerySchema),
    async (c) => {
      const repo = reportRepository(c.get("prisma"));
      try {
        const report = await repo.sales(c.req.valid("query"));
        return c.json<SuccessResponse<typeof report>>(
          { success: true, message: "Sales report generated", data: report },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )
  .get(
    "/collections",
    verifyUserRoleAccess("ADMIN", "COLLECTIONS", "SALES_SUPERVISOR"),
    zValidator("query", CollectionsReportQuerySchema),
    async (c) => {
      const repo = reportRepository(c.get("prisma"));
      try {
        const report = await repo.collections(c.req.valid("query"));
        return c.json<SuccessResponse<typeof report>>(
          { success: true, message: "Collections report generated", data: report },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  )
  .get(
    "/meta",
    verifyUserRoleAccess("ADMIN", "MARKETING", "SALES_SUPERVISOR"),
    zValidator("query", MetaReportQuerySchema),
    async (c) => {
      const repo = reportRepository(c.get("prisma"));
      try {
        const report = await repo.meta(c.req.valid("query"));
        return c.json<SuccessResponse<typeof report>>(
          { success: true, message: "Meta report generated", data: report },
          200,
        );
      } catch (err) {
        handleRepoError(err);
      }
    },
  );