import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; // 1. Import http module
import { Server } from 'socket.io'; // 2. Import socket.io
import connectDB from './config/db.js';
import redisClient from './config/redisClient.js'; // 3. Import the redisClient

import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== API Routes =====
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Backend server is running...');
});

app.use(errorHandler);

// ===== WebSocket and Server Setup =====
const server = http.createServer(app); // 4. Create an HTTP server from the Express app

const io = new Server(server, { // 5. Initialize socket.io with the server
  cors: {
    origin: "*", // Allow all origins for simplicity. In production, restrict this.
    methods: ["GET", "POST"]
  }
});

// 6. Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // Store the user ID when they authenticate
  socket.on('authenticate', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('👋 A user disconnected:', socket.id);
    // Remove user from the map on disconnect
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// 7. Subscribe to Redis notifications
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
server.listen(PORT, () => { // 8. Start the HTTP server
  console.log(`✅ Server (including WebSocket) running at http://localhost:${PORT}`);
});