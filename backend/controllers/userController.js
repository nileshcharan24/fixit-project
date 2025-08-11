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
  // 1. Destructure request body, ignoring 'role' and 'skills'
  const { name, email, password, apartmentNumber, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // 2. Create the user, explicitly setting the role to 'resident'
  const user = await User.create({
    name,
    email,
    password,
    apartmentNumber,
    phone,
    role: 'resident', // This is the security fix
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // This will always be 'resident'
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Create a user (by an admin)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = asyncHandler(async (req, res) => {
  // Admin can provide all details in the body
  const { name, email, password, role, apartmentNumber, skills, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with that email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role, // Role is respected here because it's an admin action
    apartmentNumber,
    skills,
    phone,
  });

  if (user) {
    // Note: We don't send a token back. The admin is creating an account,
    // not logging the new user in.
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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

// @desc    Update user's availability status
// @route   PUT /api/users/availability
// @access  Private (Worker)
export const updateUserAvailability = asyncHandler(async (req, res) => {
  // 1. Get the 'isAvailable' status from the request body
  const { isAvailable } = req.body;

  // 2. The user's ID is available from the 'protect' middleware
  const userId = req.user.id; 

  // 3. Find the user by their ID
  const user = await User.findById(userId);

  if (user) {
    // 4. Update the isAvailable field
    user.isAvailable = isAvailable;
    const updatedUser = await user.save();

    // 5. Send back the updated user details
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      isAvailable: updatedUser.isAvailable,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});