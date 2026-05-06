import { Hono } from "hono";
import { userRoutes } from "./users/users.index";
import { productRoutes } from "./product.route";
import { leadRoutes } from "./lead.route";
import { campaingRoutes } from "./campaing.route";
import { courseRoutes } from "./course.route";
import { paymentRoutes } from "./payment.route";
import { orderRoutes } from "./order.route";
import { authRoutes } from "./auth/auth.route";

export const apiRoutes = new Hono()
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/products", productRoutes)
  .route("/leads", leadRoutes)
  .route("/campaigns", campaingRoutes)
  .route("/courses", courseRoutes)
  .route("/payments", paymentRoutes)
  .route("/orders", orderRoutes);
