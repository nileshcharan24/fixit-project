import express from "express";
import { submitComplaint } from "../controllers/complaintController.js";

const router = express.Router();

// @route   POST /api/complaints
// @access  Private (resident only)
router.post("/", submitComplaint);

export default router;