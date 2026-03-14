import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { userRoutes } from './routes/user.route'

const app = new Hono()

app.use("*", logger())
app.route("/api/users", userRoutes)
app.get("/", (c) => {
  return c.json({ status: "ok" })
})

export default app