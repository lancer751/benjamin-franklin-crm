import express from "express";
import { getEnrollmentById, getEnrollments } from "../controllers/enrollment.controller";
const router = express.Router();

router.get("/", getEnrollments)
router.get("/:id", getEnrollmentById)

export default router;