import express from "express";
import { createNewCustomer, getAllCustomers, getSingleCustomer, updateCustomer } from "../controllers/customer.controller";

const router = express.Router();

router.get("/", getAllCustomers);
router.get("/:id", getSingleCustomer);
router.post("/", createNewCustomer);
router.put("/:id", updateCustomer)

export default router;
