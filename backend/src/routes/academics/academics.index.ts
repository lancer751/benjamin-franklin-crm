import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { Hono } from "hono";
import { professorRoutes } from "./professors.route";
import { courseRoutes } from "./courses/course.index";
import withPrisma from "@/lib/prisma";

export const academicRoutes = new Hono()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR", "SALES_REP"))
  .route("/professors", professorRoutes)
  .route("/courses", courseRoutes)