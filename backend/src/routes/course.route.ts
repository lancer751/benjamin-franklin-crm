import express from "express";
import { createCourse, getCourseById, getCourses, updateCourse } from "../controllers/course.controller";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = express.Router();

// GET /courses
router.get("/", getCourses);
router.get("/:id", getCourseById);
// POST /courses — admin only
router.post("/", adminMiddleware, createCourse);
router.put("/:id", adminMiddleware, updateCourse);

export default router;