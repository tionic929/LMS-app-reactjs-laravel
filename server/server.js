// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
// Middleware to allow Express to parse JSON body requests
app.use(express.json()); 
// Set up CORS for the Express API endpoints
app.use(cors({ origin: 'http://localhost:5173' })); 

const server = http.createServer(app);

// Initialize Socket.IO and allow CORS for the WebSocket connection
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The URL where your React app is running (Vite default)
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// --- Socket.IO Connection and Event Handling ---

io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);

  // Send a welcome message just to the client that just connected
  socket.emit('status', { message: 'Connected to Notification Service', type: 'info' });

  // 1. Recurring System Event Simulation (Example: System Maintenance Alert)
  const systemIntervalId = setInterval(() => {
    const messageData = {
      message: `System Reminder: Please save your work.`,
      type: 'warning', 
    };
    
    // Broadcast to ALL connected clients
    io.emit('new_notification', messageData);
  }, 30000); // Sends every 30 seconds

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
    clearInterval(systemIntervalId); // Clean up the interval
  });
});


// --- Express API Endpoint Integration ---

// 2. Simulated API Endpoint (Example: New order/signup)
app.post('/api/new-event', (req, res) => {
  const { username, eventType } = req.body;
  
  if (!username || !eventType) {
    return res.status(400).send({ message: "Missing username or eventType" });
  }

  // Define the notification payload
  const notificationPayload = {
    message: `[${eventType.toUpperCase()}] New activity recorded for user: ${username}`,
    type: 'success', 
  };
  
  // Broadcast the notification to ALL clients immediately
  io.emit('new_notification', notificationPayload);
  console.log(`[API] Broadcasted: ${notificationPayload.message}`);

  res.status(200).send({ success: true, message: "Event received and notification sent." });
});


// --- Start Server ---

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});