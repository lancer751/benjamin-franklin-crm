import express from "express";
import { createOrder, getOrderById, getOrders } from "../controllers/order.controller";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
// router.get("/:id", getCourseById);
// router.post("/", createCourse);

export default router;