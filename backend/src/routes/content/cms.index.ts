import { Hono } from "hono";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import { benefitRoutes } from "./benefits/benefit.route";
import withPrisma from "@/lib/prisma";
import { certificationRoutes } from "./certifications/certification.route";
import { faqRoutes } from "./faqs/faq.route";
import { productsComercialContent } from "./content.route";

export const cmsRoutes = new Hono()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN"))
  .route("/products", productsComercialContent)
  .route("/benefits", benefitRoutes)
  .route("/certifications", certificationRoutes)
  .route("/faqs", faqRoutes);
