import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { userRoutes } from '@routes/user.route'
import { courseRoutes } from '@routes/course.route'
import { leadRoutes } from '@/routes/lead.route'
import { dashboardRoutes } from '@routes/dashboard.route'
import { enrollmentRoutes } from '@routes/enrollment.route'
import { orderRoutes } from '@routes/order.route'
import { paymentRoutes } from '@routes/payment.route'
import { productRoutes } from '@routes/product.route'
import { reportRoutes } from '@routes/report.route'
import { webhookRoutes } from '@routes/webhook.route'
import { cors } from 'hono/cors'

const app = new Hono()

app.use("*", logger())
app.use("*", cors({
  origin: "*",
}))

const _apiRoutes = app
  .basePath("/api")
  .route("/leads", leadRoutes)

app.get("/", (c) => {
  return c.json({ status: "ok" })
})

export default app
export type ApiRoutes = typeof _apiRoutes