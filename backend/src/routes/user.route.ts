import express from "express";
import { createUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller";
const router = express.Router();

router.get("/", getAllUsers)
router.get("/:id", getUserById)
router.post("/", createUser)
router.put("/:id", updateUser)

export default router;