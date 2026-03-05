import express from "express";
import { generateEnrollment, getEnrollmentById, getEnrollments, updateEnrollmentStatus } from "../controllers/enrollment.controller";
const router = express.Router();

router.get("/", getEnrollments)
router.get("/:id", getEnrollmentById)
router.post("/", generateEnrollment)
router.put("/:id", updateEnrollmentStatus)

export default router;