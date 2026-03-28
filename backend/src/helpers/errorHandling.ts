import type { Context } from "hono"

// ✅ Helper for consistent error handling
export const handleError = (c: Context, error: unknown, message: string) => {
  console.error(message, error)
  return c.json({error: message}, 500)
}