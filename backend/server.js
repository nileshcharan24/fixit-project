import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ===== Middleware =====
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse incoming JSON requests

// ===== API Routes =====
app.use("/api/users", userRoutes);         // User-related routes
app.use("/api/complaints", complaintRoutes); // Complaint submission routes

// ===== Default Route =====
app.get('/', (req, res) => {
  res.send('🚀 Backend server is running...');
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
console.log("JWT Secret is:", process.env.JWT_SECRET);
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

