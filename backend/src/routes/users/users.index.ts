import { Hono } from "hono";
import { userGeneralRoutes } from "./overall/overall.route";
import { sellersRoutes } from "./sellers/sellers.route";
import { salesSupervisorsRoutes } from "./sales-supervisors/sales-supervisors.route";


export const userRoutes = new Hono()
userRoutes.route("/", userGeneralRoutes)
userRoutes.route("/sellers", sellersRoutes)
userRoutes.route("/sales-supervisors", salesSupervisorsRoutes)