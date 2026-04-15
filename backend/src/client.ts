import  {hc} from "hono/client";
import type { apiRoutes } from "./app";

export type AppType = typeof apiRoutes;
export type Client = ReturnType<typeof hc<AppType>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);