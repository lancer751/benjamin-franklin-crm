import { Hono } from "hono";
import { userGeneralRoutes } from "./overall/overall.route";
import { sellersRoutes } from "./sellers/sellers.route";
import { salesSupervisorsRoutes } from "./sales-supervisors/sales-supervisors.route";
import { marketersRoute } from "./marketers/marketerts.route";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";

export const userRoutes = new Hono()
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR", "SALES_REP"))
  .route("/", userGeneralRoutes)
  .route("/sellers", sellersRoutes)
  .route("/sales-supervisors", salesSupervisorsRoutes)
  .route("/marketers", marketersRoute);