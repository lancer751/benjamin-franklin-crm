// src/env.ts
import { z } from "zod";

// Helper: splits "url1,url2,url3" strings into a trimmed string array
const commaSeparatedUrls = z.string().transform((val) =>
  val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const envSchema = z.object({
  //  Server
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return (
            (parsed.protocol === "postgresql:" ||
              parsed.protocol === "postgres:") &&
            parsed.hostname.length > 0 && // host exists
            parsed.pathname.length > 1 // /dbname exists (not just "/")
          );
        } catch {
          return false;
        }
      },
      {
        message:
          "DATABASE_URL must be a valid PostgreSQL URL: postgresql://user:pass@host:5432/dbname",
      },
    ),
  //  Origins
  ALLOWED_ORIGINS: commaSeparatedUrls,
  PROOF_ORIGINS: commaSeparatedUrls,
  //  JWT secrets
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  //  Token expiry (stored as minutes for access and days for refresh)
  ACCESS_TOKEN_EXP_TIME: z.coerce.number().int().positive(),
  REFRESH_TOKEN_EXP_TIME: z.coerce.number().int().positive(),
  //  Cookie settings
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKE_SAME_SITE: z.enum(["Lax", "Strict", "None"]).default("Lax"),
});
// Validate at startup — fail fast if anything is missing or wrong
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const envParsed = parsed.data;
export type Env = z.infer<typeof envSchema>;
