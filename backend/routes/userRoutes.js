import express from "express";
import {
  registerUser,
  loginUser, // ⬅️ newly added
} from "../controllers/userController.js";

const router = express.Router();

// Route for registering a user
router.post("/register", registerUser);

// ✅ Route for logging in a user
router.post("/login", loginUser);

export default router;
