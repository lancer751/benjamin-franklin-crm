import {z} from "zod";

export const UUIDField = z.uuid().length(36);
export const DecimalField = z.number().nonnegative().multipleOf(0.01);
export const OptionalUrl = z.url().optional().nullable();
export const OptionalString = z.string().optional().nullable();