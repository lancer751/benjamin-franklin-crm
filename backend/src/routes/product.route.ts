import express from "express";
import { createProduct, getProductById, getProducts, updateProduct } from "../controllers/product.controller";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);

export default router;