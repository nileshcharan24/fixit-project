import express from "express";
import passport from "passport"; // 1. Import Passport
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserAvailability,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import jwt from 'jsonwebtoken'; // 2. Import JWT

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Google OAuth Routes ---

// 3. The route to start the Google authentication process
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 4. The callback route that Google redirects to after authentication
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }), // We use JWTs, so no sessions
  (req, res) => {
    // After successful authentication, Passport attaches the user to req.user
    // We then generate our own JWT and send it back
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    // For a real app, you would redirect to your frontend with the token
    // For now, we'll just send it back as JSON
    res.json({
      message: "Successfully authenticated with Google!",
      user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
      },
      token: token,
    });
  }
);

// --- Protected Routes ---

// Admin-only routes
router.route("/").get(protect, authorizeRoles("admin"), getAllUsers);

// Worker-only routes
router.route("/availability").put(protect, authorizeRoles("worker"), updateUserAvailability);

export default router;