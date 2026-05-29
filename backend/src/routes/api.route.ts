import { Hono } from "hono";
import { userRoutes } from "./users/users.index";
import { leadRoutes } from "./lead/lead.route";
import { campaingRoutes } from "./campaing/campaing.route";
import { paymentRoutes } from "./payments/payment.route";
import { authRoutes } from "./auth/auth.route";
import { academicRoutes } from "./academics/academics.index";
import { orderRoutes } from "./content/orders/order.route";
import { productRoutes } from "./products/product.index";
import { storefrontRoute } from "./storefront/storefront.route";
import { cmsRoutes } from "./content/cms.index";

export const apiRoutes = new Hono()
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/products", productRoutes)
  .route("/leads", leadRoutes)
  .route("/campaigns", campaingRoutes)
  .route("/payments", paymentRoutes)
  .route("/orders", orderRoutes)
  .route("/academic", academicRoutes)
  .route("/storefront", storefrontRoute)
  .route("/cms", cmsRoutes)