import asyncHandler from 'express-async-handler';
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import redisClient from '../config/redisClient.js';

// @desc    Submit a new complaint and auto-assign if possible
// @route   POST /api/complaints
export const submitComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, apartmentNumber } = req.body;
  const ASSIGNMENT_CAP = parseInt(process.env.ASSIGNMENT_CAP, 10) || 5;

  const workers = await User.find({
    role: 'worker',
    isAvailable: true,
    skills: category,
    activeComplaintCount: { $lt: ASSIGNMENT_CAP },
  }).sort({ activeComplaintCount: 1 });

  const bestWorker = workers[0];
  const complaintData = {
    title,
    description,
    category,
    priority,
    apartmentNumber,
    submittedBy: req.user.id,
  };

  if (bestWorker) {
    complaintData.assignedTo = bestWorker._id;
    complaintData.status = 'in progress';
  }

  const newComplaint = await Complaint.create(complaintData);

  if (bestWorker) {
    bestWorker.activeComplaintCount += 1;
    await bestWorker.save();

    const notification = {
      message: `New complaint assigned: "${newComplaint.title}"`,
      workerId: bestWorker._id.toString(),
    };
    await redisClient.publish('notifications', JSON.stringify(notification));
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
  const oldStatus = complaint.status;
  const allowedStatuses = ["pending", "in progress", "resolved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  complaint.status = status;
  const updatedComplaint = await complaint.save();

  const isNowCompleted = (status === 'resolved' || status === 'rejected');
  const wasInProgress = (oldStatus === 'in progress');

  if (isNowCompleted && wasInProgress && complaint.assignedTo) {
    const worker = await User.findById(complaint.assignedTo);
    if (worker) {
      worker.activeComplaintCount = Math.max(0, worker.activeComplaintCount - 1);
      
      const nextComplaint = await Complaint.findOne({
        status: 'pending',
        category: { $in: worker.skills }
      }).sort({ createdAt: 1 });

      if (nextComplaint) {
        nextComplaint.assignedTo = worker._id;
        nextComplaint.status = 'in progress';
        await nextComplaint.save();
        worker.activeComplaintCount += 1;

        const notification = {
          message: `New complaint from queue: "${nextComplaint.title}"`,
          workerId: worker._id.toString(),
        };
        await redisClient.publish('notifications', JSON.stringify(notification));
      }
      
      await worker.save();
    }
  }

  res.status(200).json(updatedComplaint);
});

// @desc    Assign a complaint to a worker (manually)
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

  if (!worker.skills.includes(complaint.category)) {
    res.status(400);
    throw new Error(`Worker does not have the required skill for the '${complaint.category}' category.`);
  }

  complaint.assignedTo = workerId;
  complaint.status = 'in progress';
  const updatedComplaint = await complaint.save();

  const notification = {
    message: `You have been assigned a new complaint: "${updatedComplaint.title}"`,
    workerId: worker._id.toString(),
  };
  await redisClient.publish('notifications', JSON.stringify(notification));

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
export const getAllComplaints = asyncHandler(async (req, res) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  query = Complaint.find(reqQuery);

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Complaint.countDocuments(reqQuery);

  query = query.skip(startIndex).limit(limit);
  const complaints = await query;
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

// @desc    Delete a complaint
export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (
    req.user.role !== 'admin' &&
    complaint.submittedBy.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error('User not authorized to delete this complaint');
  }

  await complaint.deleteOne();
  res.status(200).json({ success: true, message: 'Complaint removed' });
});