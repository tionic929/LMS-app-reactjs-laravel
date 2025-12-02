// server.js (Node.js/Express/Socket.IO)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// 1. MIDDLEWARE: Allows Express to parse incoming JSON bodies (Fixes 404/Cannot POST)
app.use(express.json()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // 🛑 CRITICAL: MUST match your client's URL 
    origin: '*', // Set specific origin later, using * for wide testing
    methods: ['GET', 'POST'],
    credentials: true 
  },
});


// --- SOCKET.IO CONNECTION HANDLER ---

io.on('connection', (socket) => {
    const { userId, userRole } = socket.handshake.query;
    
    // Validation check
    if (!userId || Array.isArray(userId)) {
        console.error(`[SERVER] Connection rejected: Invalid or missing User ID: ${userId}`);
        socket.disconnect(true); 
        return;
    }

    const userRoom = `user:${userId}`;
    const roleRoom = `role:${userRole || 'guest'}`;
    
    // Join rooms
    socket.join([userRoom, roleRoom]);

    console.log(`[SERVER] User connected - Socket ID: ${socket.id}, DB ID: ${userId}, Role: ${userRole}`);

    // 🛑 FIX for Loop: Send connection confirmation on a dedicated event name
    socket.emit('socket_ready', { // 🛑 NEW EVENT NAME
        message: `Connected successfully. Joined rooms: ${userRoom}, ${roleRoom}`,
        type: 'info' 
    });
    
    // --- Temporary Test Message to confirm room joining works ---
    setTimeout(() => {
        io.to(userRoom).emit('new_notification', {
            message: `TEST: Private alert for user ${userId}.`,
            type: 'success'
        });
        console.log(`[SERVER] Sent TEST immediate notification to room: ${userRoom}`);
    }, 1000); // 1 second delay

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`[SERVER] User disconnected - DB ID: ${userId}, Reason: ${reason}`);
    });
});


// --- API ENDPOINT FOR NOTIFICATION TESTING ---

app.get('/', (req, res) => {
    res.status(200).send('Socket.IO Server is running and Express is functional.');
});

/**
 * API Endpoint to trigger a notification to a specific user or role.
 * POST to http://localhost:3000/api/send-notification
 */
app.post('/api/send-notification', (req, res) => {
    const { targetType, targetId, message, type } = req.body;

    if (!targetType || !targetId || !message || !type) {
        return res.status(400).json({ error: 'Missing required parameters: targetType, targetId, message, or type.' });
    }

    const room = `${targetType}:${targetId}`; 
    
    io.to(room).emit('new_notification', {
        message: message,
        type: type 
    });
    
    const socketsInRoom = io.sockets.adapter.rooms.get(room);
    const socketCount = socketsInRoom ? socketsInRoom.size : 0;
    
    if (socketCount > 0) {
        console.log(`[SERVER-API] Success: Sent to ${socketCount} socket(s) in room ${room}.`);
        res.status(200).json({ status: 'sent', room: room, sockets: socketCount });
    } else {
        console.warn(`[SERVER-API] WARNING: Room ${room} is empty. No clients received the message.`);
        res.status(200).json({ status: 'emitted', room: room, sockets: 0, warning: 'Room is empty' });
    }
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Express and Socket server listening on port ${PORT}`);
});