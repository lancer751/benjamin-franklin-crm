import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { Hono } from "hono";
import { professorRoutes } from "./professors.route";
import { courseRoutes } from "./courses/course.index";

export const academicRoutes = new Hono()
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"))
  .route("/professors", professorRoutes)
  .route("/courses", courseRoutes)