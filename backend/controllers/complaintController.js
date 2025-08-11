import asyncHandler from 'express-async-handler'; // 1. Import asyncHandler
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// @desc    Submit a new complaint and auto-assign if possible
// @route   POST /api/complaints
export const submitComplaint = asyncHandler(async (req, res) => {
  // The user's ID is now taken from the token, not the body
  const { title, description, category, priority, apartmentNumber } = req.body;

  // --- Auto-Assignment Logic ---
  const ASSIGNMENT_CAP = parseInt(process.env.ASSIGNMENT_CAP, 10) || 10;

  // 1. Find the best worker for the job
  const workers = await User.find({
    role: 'worker',
    isAvailable: true,
    skills: category, // Find workers whose skills array includes the complaint's category
    activeComplaintCount: { $lt: ASSIGNMENT_CAP }, // Find workers below the assignment cap
  }).sort({ activeComplaintCount: 1 }); // Sort by who has the least work (ascending)

  const bestWorker = workers[0]; // The best worker is the first one in the sorted list

  // 2. Create the complaint document
  const complaintData = {
    title,
    description,
    category,
    priority,
    apartmentNumber,
    submittedBy: req.user.id, // Use the ID from the authenticated user
  };

  // 3. If a suitable worker was found, assign the complaint
  if (bestWorker) {
    complaintData.assignedTo = bestWorker._id;
    complaintData.status = 'in progress';
  }
  // If no worker is found, it will be saved with the default 'pending' status

  const newComplaint = await Complaint.create(complaintData);

  // 4. If assigned, update the worker's active complaint count
  if (bestWorker) {
    bestWorker.activeComplaintCount += 1;
    await bestWorker.save();
  }

  res.status(201).json(newComplaint);
});

// @desc    Update complaint status and re-assign if a worker becomes free
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  const { status } = req.body;
  const oldStatus = complaint.status; // Store the old status for comparison
  const allowedStatuses = ["pending", "in progress", "resolved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  complaint.status = status;
  const updatedComplaint = await complaint.save();

  // --- Dynamic Re-assignment Logic ---
  // Check if a complaint was just completed and was assigned to a worker
  const isNowCompleted = (status === 'resolved' || status === 'rejected');
  const wasInProgress = (oldStatus === 'in progress');

  if (isNowCompleted && wasInProgress && complaint.assignedTo) {
    const worker = await User.findById(complaint.assignedTo);

    if (worker) {
      // 1. Decrement the worker's active complaint count
      worker.activeComplaintCount = Math.max(0, worker.activeComplaintCount - 1);
      
      // 2. Find a new pending complaint that matches the worker's skills
      const nextComplaint = await Complaint.findOne({
        status: 'pending',
        category: { $in: worker.skills } // Find a complaint where category is in the worker's skills array
      }).sort({ createdAt: 1 }); // Get the oldest one

      // 3. If a suitable pending complaint is found, assign it
      if (nextComplaint) {
        nextComplaint.assignedTo = worker._id;
        nextComplaint.status = 'in progress';
        await nextComplaint.save();

        // Increment the worker's count for the new assignment
        worker.activeComplaintCount += 1;
      }
      
      await worker.save();
    }
  }

  res.status(200).json(updatedComplaint);
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