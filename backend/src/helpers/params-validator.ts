import {z} from "zod";

export const validateIdParamSchema = z.object({
    id: z.uuid().length(36)
})