import express from "express";
import { createOrder, getOrderById, getOrders, updateSingleOrder } from "../controllers/order.controller";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateSingleOrder);

export default router;