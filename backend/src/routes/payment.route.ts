import express from "express";
import { getPaymentById, getPayments, registerManualPayment } from "../controllers/payment.controller";

const router = express.Router();

// POST /payments/manual  — admin only
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/manual", registerManualPayment);

export default router;
