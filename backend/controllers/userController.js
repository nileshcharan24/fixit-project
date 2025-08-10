import asyncHandler from 'express-async-handler';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, apartmentNumber, skills, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name, email, password, role, apartmentNumber, skills, phone,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// === NEW FUNCTION ADDED BELOW ===

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};
  
  // If a role is provided in the query, add it to the filter
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Find users based on the filter and exclude the password field
  const users = await User.find(filter).select('-password');
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});