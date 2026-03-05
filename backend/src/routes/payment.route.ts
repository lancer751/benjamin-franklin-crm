import express from "express";
import { getPaymentById, getPayments, registerManualPayment, updatePaymentStatus } from "../controllers/payment.controller";

const router = express.Router();

// POST /payments/manual  — admin only
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/manual", registerManualPayment);
router.put("/manual/:id", updatePaymentStatus);

export default router;
