import express from "express";
import { getSalesReport } from "../controllers/report.controller";

const router = express.Router();

// GET /reports/sales?startDate=&endDate=&courseId=&paymentMethod=
router.get("/sales", getSalesReport);

export default router;
