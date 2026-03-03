import express from "express";
import {
    simulatePayment,
    getSimulatedEmails,
    clearSimulatedEmails,
} from "../controllers/dev.controller";

const router = express.Router();

// POST /dev/simulate-payment
router.post("/simulate-payment", simulatePayment);

// GET /dev/emails
router.get("/emails", getSimulatedEmails);

// DELETE /dev/emails
router.delete("/emails", clearSimulatedEmails);

export default router;
