import z from "zod";

export const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format");
