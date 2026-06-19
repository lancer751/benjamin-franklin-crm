import { Hono } from "hono";
import { userRoutes } from "./users/users.index";
import { campaignMemberRoutes, leadRoutes } from "./lead/lead.route";
import { paymentRoutes } from "./payments/payment.route";
import { authRoutes } from "./auth/auth.route";
import { academicRoutes } from "./academics/academics.index";
import { orderRoutes } from "./content/orders/order.route";
import { productRoutes } from "./products/product.index";
import { storefrontRoute } from "./storefront/storefront.route";
import { cmsRoutes } from "./content/cms.index";
import { campaignRoutes } from "./campaing/campaing.route";

export const apiRoutes = new Hono()
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/products", productRoutes)
  .route("/leads", leadRoutes)
  .route("/campaigns/:campaignId/members", campaignMemberRoutes)
  .route("/campaigns", campaignRoutes)
  .route("/payments", paymentRoutes)
  .route("/orders", orderRoutes)
  .route("/academic", academicRoutes)
  .route("/storefront", storefrontRoute)
  .route("/cms", cmsRoutes)