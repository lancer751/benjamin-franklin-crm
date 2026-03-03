import express from "express";
import { handlePaymentWebhook } from "../controllers/webhook.controller";

const router = express.Router();

// POST /webhooks/payment
router.post("/payment", handlePaymentWebhook);

export default router;
