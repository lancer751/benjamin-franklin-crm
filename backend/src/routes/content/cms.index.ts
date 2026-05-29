import { Hono } from "hono";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { benefitRoutes } from "./benefits/benefit.route";
import withPrisma from "@/lib/prisma";
import { certificationRoutes } from "./certifications/certification.route";
import { faqRoutes } from "./faqs/faq.route";

export const productRoutes = new Hono()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN"))
  .route("/benefits", benefitRoutes)
  .route("/certifications", certificationRoutes)
  .route("/faqs", faqRoutes);
