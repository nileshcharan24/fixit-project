import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Public (for now — later we'll secure it with auth)
export const submitComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      submittedBy,
      apartmentNumber,
    } = req.body;

    const newComplaint = new Complaint({
      title,
      description,
      category,
      priority,
      submittedBy,
      apartmentNumber,
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (admin and worker only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status } = req.body;

    // Optional: Validate status input (e.g., only allow certain values)
    const allowedStatuses = ["pending", "in progress", "resolved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged-in user's complaints
// @route   GET /api/complaints/mycomplaints
// @access  Private
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.id });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all complaints (admin/worker)
// @route   GET /api/complaints
// @access  Private (admin, worker)
export const getAllComplaints = async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    // We might add more role-based logic here later
    // For now, it fetches all complaints matching the query

    const complaints = await Complaint.find(query);

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};