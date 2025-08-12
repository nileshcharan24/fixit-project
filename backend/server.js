import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import passport from 'passport';

import connectDB from './config/db.js';
import redisClient from './config/redisClient.js';
import './config/passport-setup.js'; // This will now correctly load with the environment variables

import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { errorHandler } from './middleware/errorMiddleware.js';

// Connect to Databases
connectDB();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// ===== API Routes =====
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Backend server is running...');
});

// ===== Error Handler =====
app.use(errorHandler);

// ===== WebSocket and Server Setup =====
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('authenticate', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('👋 A user disconnected:', socket.id);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Subscribe to Redis notifications
(async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  
  await subscriber.subscribe('notifications', (message) => {
    console.log('📢 Received message from Redis:', message);
    const notification = JSON.parse(message);
    const recipientSocketId = connectedUsers.get(notification.workerId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_notification', notification);
      console.log(`🚀 Emitted notification to worker ${notification.workerId}`);
    }
  });
})();

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server (including WebSocket) running at http://localhost:${PORT}`);
});