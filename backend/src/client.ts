import  {hc} from "hono/client";
import type {  appRoutes} from "./app";

export type AppTypes = typeof appRoutes;
export type Client = ReturnType<typeof hc<AppTypes>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppTypes>(...args);