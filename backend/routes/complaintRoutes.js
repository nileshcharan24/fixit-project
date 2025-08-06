import express from "express";
import {
  submitComplaint,
  updateComplaintStatus,
  getMyComplaints,
  getAllComplaints,
} from "../controllers/complaintController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// I've combined the new GET route with your existing POST route for the same "/" path.
// This is a standard way to organize and requires no changes in other files.
router
  .route("/")
  .post(protect, authorizeRoles("resident"), submitComplaint) // Your existing POST route
  .get(protect, authorizeRoles("admin", "worker"), getAllComplaints); // The NEW GET route

// Your existing route for a user to get their own complaints
router.route("/mycomplaints").get(protect, getMyComplaints);

// Your existing route to update status
router
  .route("/:id/status")
  .put(protect, authorizeRoles("admin", "worker"), updateComplaintStatus);

export default router;