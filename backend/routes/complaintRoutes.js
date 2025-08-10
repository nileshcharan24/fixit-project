import express from "express";
import {
  submitComplaint,
  updateComplaintStatus,
  getMyComplaints,
  getAllComplaints,
  assignComplaint,
  deleteComplaint, // 1. Import the new function
} from "../controllers/complaintController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("resident"), submitComplaint)
  .get(protect, authorizeRoles("admin", "worker"), getAllComplaints);

router.route("/mycomplaints").get(protect, getMyComplaints);

// --- NEW ROUTE ADDED HERE ---
// This route handles deleting a specific complaint
router.route("/:id").delete(protect, deleteComplaint); // 2. Add the DELETE route

router
  .route("/:id/status")
  .put(protect, authorizeRoles("admin", "worker"), updateComplaintStatus);

router
  .route("/:id/assign")
  .put(protect, authorizeRoles("admin"), assignComplaint);

export default router;