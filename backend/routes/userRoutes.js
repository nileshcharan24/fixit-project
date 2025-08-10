import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers, // 1. Import the new controller
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js"; // 2. Import middleware

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin-only routes
// 3. Add the new GET route
router.route("/").get(protect, authorizeRoles("admin"), getAllUsers);

export default router;