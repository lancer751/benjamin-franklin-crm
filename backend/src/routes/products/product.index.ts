import { Hono } from "hono";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { productGeneralRoutes } from "./product.route";
import { categoryRoutes } from "./categories/category.route";
import withPrisma from "@/lib/prisma";


export const productRoutes = new Hono()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR", "MARKETING"))
  .route("/", productGeneralRoutes)
  .route("/categories", categoryRoutes)
