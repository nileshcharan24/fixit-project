import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserAvailability, // 1. Import the new function
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin-only routes
router.route("/").get(protect, authorizeRoles("admin"), getAllUsers);

// Worker-only routes
// 2. Add the new route for updating availability
router
  .route("/availability")
  .put(protect, authorizeRoles("worker"), updateUserAvailability);

export default router;