import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { userRoutes } from '@routes/user.route'
import { courseRoutes } from '@routes/course.route'
import { customerRoutes } from '@routes/customer.route'
import { dashboardRoutes } from '@routes/dashboard.route'
import { enrollmentRoutes } from '@routes/enrollment.route'
import { orderRoutes } from '@routes/order.route'
import { paymentRoutes } from '@routes/payment.route'
import { productRoutes } from '@routes/product.route'
import { reportRoutes } from '@routes/report.route'
import { webhookRoutes } from '@routes/webhook.route'

const app = new Hono()

app.use("*", logger())

const _apiRoutes = app
  .basePath("/api")
  .route("/users", userRoutes)
  .route("/courses", courseRoutes)
  .route("/customers", customerRoutes)
  .route("/dashboard", dashboardRoutes)
  .route("/enrollments", enrollmentRoutes)
  .route("/orders", orderRoutes)
  .route("/payments", paymentRoutes)
  .route("/products", productRoutes)
  .route("/reports", reportRoutes)
  .route("/webhooks", webhookRoutes)

app.get("/", (c) => {
  return c.json({ status: "ok" })
})

export default app
export type ApiRoutes = typeof _apiRoutes