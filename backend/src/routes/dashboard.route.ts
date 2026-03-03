import express from "express";
import { getPaymentsDashboard } from "../controllers/dashboard.controller";

const router = express.Router();

// GET /dashboard/payments
router.get("/payments", getPaymentsDashboard);

export default router;
