import { Hono } from "hono";
import { userGeneralRoutes } from "./overall/overall.route";
import { sellersRoutes } from "./sellers/sellers.route";
import { salesSupervisorsRoutes } from "./sales-supervisors/sales-supervisors.route";
import { marketersRoute } from "./marketers/marketerts.route";


export const userRoutes = new Hono()
userRoutes.route("/", userGeneralRoutes)
userRoutes.route("/sellers", sellersRoutes)
userRoutes.route("/sales-supervisors", salesSupervisorsRoutes)
userRoutes.route("/marketers", marketersRoute)