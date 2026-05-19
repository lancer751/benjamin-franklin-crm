import { Hono } from "hono";
import { courseGeneralRoutes } from "./course.route";
import { editionRoutes } from "./editions/edition.route";

export const courseRoutes = new Hono()
  .route("/editions", editionRoutes)
  .route("/", courseGeneralRoutes)