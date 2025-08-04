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
