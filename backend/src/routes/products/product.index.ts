import { Hono } from "hono";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { productGeneralRoutes } from "./product.route";
import { categoryRoutes } from "./categories/category.route";
import { benefitRoutes } from "./benefits/benefit.route";

export const productRoutes = new Hono()
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN"))
  .route("/", productGeneralRoutes)
  .route("/categories", categoryRoutes)
  .route("/benefits", benefitRoutes)