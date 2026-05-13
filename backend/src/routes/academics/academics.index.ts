import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { Hono } from "hono";
import { professorRoutes } from "./professors.route";

export const academicRoutes = new Hono()
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess)
  .basePath("/academic")
  .route("/professors", professorRoutes);