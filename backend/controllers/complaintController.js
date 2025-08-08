import asyncHandler from 'express-async-handler'; // 1. Import asyncHandler
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// @desc    Submit a new complaint
export const submitComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, submittedBy, apartmentNumber } = req.body;

  const newComplaint = new Complaint({
    title, description, category, priority, submittedBy, apartmentNumber,
  });

  const savedComplaint = await newComplaint.save();
  res.status(201).json(savedComplaint);
});

// @desc    Update complaint status
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (complaint) {
    const { status } = req.body;
    const allowedStatuses = ["pending", "in progress", "resolved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid status value");
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();
    res.status(200).json(updatedComplaint);
  } else {
    res.status(404);
    throw new Error("Complaint not found");
  }
});

// @desc    Get logged-in user's complaints
export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ submittedBy: req.user.id });
  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

// @desc    Get all complaints (admin/worker)
// We might add more role-based logic here later
// For now, it fetches all complaints matching the query

export const getAllComplaints = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }
  const complaints = await Complaint.find(query);
  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

// @desc    Assign a complaint to a worker
export const assignComplaint = asyncHandler(async (req, res) => {
  const { workerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  const worker = await User.findById(workerId);
  if (!worker || worker.role !== 'worker') {
    res.status(404);
    throw new Error("Worker not found or this user is not a worker");
  }

  complaint.assignedTo = workerId;
  complaint.status = 'in progress';
  const updatedComplaint = await complaint.save();
  res.status(200).json(updatedComplaint);
});