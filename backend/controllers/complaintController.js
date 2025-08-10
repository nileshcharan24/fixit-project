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

// @desc    Get all complaints with advanced filtering/sorting/pagination
// @route   GET /api/complaints
// @access  Private (admin, worker)
export const getAllComplaints = asyncHandler(async (req, res) => {
  let query;

  // 1. Create a copy of the query parameters
  const reqQuery = { ...req.query };

  // 2. Define fields to exclude from filtering (for sorting, pagination etc.)
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // 3. Remove excluded fields from the query copy
  removeFields.forEach(param => delete reqQuery[param]);

  // 4. Create the initial query to find complaints
  query = Complaint.find(reqQuery);

  // 5. Select specific fields (if requested)
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // 6. Sort the results
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort by newest if nothing is specified
    query = query.sort('-createdAt');
  }

  // 7. Implement Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25; // Show 25 per page by default
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Complaint.countDocuments(reqQuery); // Get total count matching the filter

  query = query.skip(startIndex).limit(limit);

  // --- Execute the final query ---
  const complaints = await query;

  // 8. Create pagination metadata for the response
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: complaints.length,
    total,
    pagination,
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

  // === NEW VALIDATION LOGIC ADDED BELOW ===

  // Check if the worker's skills array includes the complaint's category
  if (!worker.skills.includes(complaint.category)) {
    res.status(400); // 400 Bad Request, as the assignment is invalid
    throw new Error(
      `Worker does not have the required skill for the '${complaint.category}' category.`
    );
  }

  // If the skill check passes, proceed with the assignment
  complaint.assignedTo = workerId;
  complaint.status = 'in progress';
  const updatedComplaint = await complaint.save();
  res.status(200).json(updatedComplaint);
});

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (owner or admin)
export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Check permissions: User must be an admin OR the person who submitted it
  if (
    req.user.role !== 'admin' &&
    complaint.submittedBy.toString() !== req.user.id
  ) {
    res.status(403); // Forbidden
    throw new Error('User not authorized to delete this complaint');
  }

  // If checks pass, delete the complaint
  await complaint.deleteOne();

  res.status(200).json({ success: true, message: 'Complaint removed' });
});