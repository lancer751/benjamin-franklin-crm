import express from "express";
import { generateEnrollment, getEnrollmentById, getEnrollments } from "../controllers/enrollment.controller";
const router = express.Router();

router.get("/", getEnrollments)
router.get("/:id", getEnrollmentById)
router.post("/", generateEnrollment)

export default router;