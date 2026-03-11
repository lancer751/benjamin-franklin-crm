import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { userRoutes } from './routes/user.route'

const app = new Hono()
app.use(logger())
app.route("/api/users", userRoutes)

export default app