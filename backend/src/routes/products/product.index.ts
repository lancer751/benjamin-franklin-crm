import { Hono } from "hono";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { productGeneralRoutes } from "./product.route";
import { categoryRoutes } from "./categories/category.route";
import { benefitRoutes } from "./benefits/benefit.route";
import withPrisma from "@/lib/prisma";
import { certificationRoutes } from "./certifications/certification.route";
import { faqRoutes } from "./faqs/faq.route";

export const productRoutes = new Hono()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"))
  .route("/", productGeneralRoutes)
  .route("/categories", categoryRoutes)
  .route("/benefits", benefitRoutes)
  .route("/certifications", certificationRoutes)
  .route("/faqs", faqRoutes);
