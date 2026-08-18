import { zValidator as zv } from "@hono/zod-validator";
import type { ErrorResponse } from "shared";
import type { ZodType } from "zod";

export const zValidator = <T extends ZodType>(
  target: "json" | "param" | "query",
  schema: T,
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue
        ? `${issue.path.join(".")}: ${issue.message}`
        : "Datos inválidos";

      return c.json<ErrorResponse>(
        { success: false, error: message, isFormError: true },
        400,
      );
    }
  });
