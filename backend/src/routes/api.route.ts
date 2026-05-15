import { Hono } from "hono";
import { userRoutes } from "./users/users.index";
import { productRoutes } from "./products/product.route";
import { leadRoutes } from "./lead/lead.route";
import { campaingRoutes } from "./campaing/campaing.route";
import { paymentRoutes } from "./payments/payment.route";
import { authRoutes } from "./auth/auth.route";
import { academicRoutes } from "./academics/academics.index";
import { orderRoutes } from "./products/orders/order.route";

export const apiRoutes = new Hono()
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/products", productRoutes)
  .route("/leads", leadRoutes)
  .route("/campaigns", campaingRoutes)
  .route("/payments", paymentRoutes)
  .route("/orders", orderRoutes)
  .route("/academic", academicRoutes)