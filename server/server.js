// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors'); 
const bcrypt = require('bcrypt'); // Required for password hashing/comparison
const { Sequelize, DataTypes } = require('sequelize'); // 🔑 NEW: Sequelize ORM

// --- 1. SETUP & CONFIGURATION (Updated for Database) ---

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const BCRYPT_SALT_ROUNDS = 10; 

const server = http.createServer(app);

// 🔑 NEW: DATABASE CONNECTION SETUP
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql', // e.g., 'mysql', 'postgres'
    logging: false // Set to true to see SQL queries in console
});

// 🔑 NEW: USER MODEL DEFINITION (Mapped to your 'users' table)
const User = sequelize.define('User', {
    // Map your table columns to the model attributes
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Assuming ID is auto-incrementing
    },
    name: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: DataTypes.STRING, // Use 'password' for the hashed password field
    role: DataTypes.STRING,
    emailVerifiedAt: { type: DataTypes.DATE, field: 'email_verified_at' },
    // These fields are crucial for the reset flow:
    passwordResetToken: { type: DataTypes.STRING, field: 'password_reset_token' },
    passwordResetExpires: { type: DataTypes.DATE, field: 'password_reset_expires' },

    // You can omit the rest, or include them for completeness:
    isEnabled: { type: DataTypes.BOOLEAN, field: 'is_enabled' },
    isConfirmed: { type: DataTypes.BOOLEAN, field: 'is_confirmed' },
    isBannedFromComments: { type: DataTypes.BOOLEAN, field: 'is_banned_from_comments' },
    rememberToken: { type: DataTypes.STRING, field: 'remember_token' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
}, {
    tableName: 'users', // The actual table name in your database
    timestamps: true,
    underscored: true, // Auto-maps camelCase model names to snake_case column names
    freezeTableName: true // Important: Stops Sequelize from pluralizing the table name
});

// --- NODEMAILER TRANSPORTER ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// --- MIDDLEWARE ---
const ALLOWED_ORIGIN = 'http://localhost:5173';

app.use(cors({ origin: ALLOWED_ORIGIN })); 
app.use(express.json()); 


// --- 2. SOCKET.IO SETUP (Unchanged) ---

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGIN, 
        methods: ['GET', 'POST'],
        credentials: true 
    },
});


// --- SOCKET.IO CONNECTION HANDLER (Unchanged) ---

io.on('connection', (socket) => {
    const { userId, userRole } = socket.handshake.query;
    
    if (!userId || Array.isArray(userId)) {
        console.error(`[SERVER] Connection rejected: Invalid or missing User ID: ${userId}`);
        socket.disconnect(true); 
        return;
    }

    const userRoom = `user:${userId}`;
    const roleRoom = `role:${userRole || 'guest'}`;
    
    socket.join([userRoom, roleRoom]);

    console.log(`[SERVER] User connected - Socket ID: ${socket.id}, DB ID: ${userId}, Role: ${userRole}`);

    socket.emit('socket_ready', { 
        message: `Connected successfully. Joined rooms: ${userRoom}, ${roleRoom}`,
        type: 'info' 
    });
    
    socket.on('disconnect', (reason) => {
        console.log(`[SERVER] User disconnected - DB ID: ${userId}, Reason: ${reason}`);
    });
});


// --- 3. FORGOT PASSWORD API LOGIC (Database Lookups) ---

// --- API Route: Request Password Reset Email ---
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    // 🔑 UPDATED: Find user by email in the actual database
    const user = await User.findOne({ where: { email } });

    if (!email || !user) {
        console.log(`Attempted reset for non-existent/invalid email: ${email}`);
        // Generic response for security
        return res.status(200).json({ 
            message: "If the email is registered, a password reset link has been sent." 
        });
    }

    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour from now, as a Date object

        // 🔑 UPDATED: Save the token and expiry to the actual database record
        await user.update({
            passwordResetToken: token,
            passwordResetExpires: expiry,
        });

        const resetUrl = `${ALLOWED_ORIGIN}/reset-password?token=${token}`;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Secure Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #3B82F6;">Password Reset</h2>
                    <p>You have requested a password reset. Please click the button below to continue:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Click Here to Reset Your Password
                    </a>
                    <p>This link is valid for 1 hour. If the button does not work, copy and paste the link below:</p>
                    <p style="font-size: 0.9em; word-break: break-all;">${resetUrl}</p>
                    <p style="font-size: 0.8em; color: #777;">If you did not request this, please ignore this email.</p>
                </div>
            `,
            text: `To reset your password, please copy and paste the following link into your browser: ${resetUrl}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully. Message ID: %s", info.messageId);
        
        res.status(200).json({ 
            message: "If the email is registered, a password reset link has been sent." 
        });

    } catch (error) {
        console.error("Forgot Password Error: Failed to process request.", error.message);
        res.status(500).json({ 
            message: "An internal server error occurred while sending the email." 
        });
    }
});

// --- API Route: Reset Password ---
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || newPassword !== confirmPassword) {
        return res.status(400).json({ 
            message: "Invalid request data. Passwords must match." 
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            message: "New password must be at least 8 characters long."
        });
    }

    // 🔑 UPDATED: Find user by token and check expiry in the actual database
    const user = await User.findOne({ 
        where: { 
            passwordResetToken: token,
            // Check if the expiry time is greater than the current time
            passwordResetExpires: { [Sequelize.Op.gt]: new Date() } 
        } 
    });

    if (!user) {
        return res.status(400).json({
            message: "The password reset link is invalid or has expired. Please request a new one."
        });
    }

    try {
        // Hash the new password
        const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

        // use laravel hashing prefix $2y$
        const laravelCompatibleHash = newPasswordHash.replace('$2b$', '$2y$');

        await user.update({
            password: laravelCompatibleHash, // Update the actual password column
            passwordResetToken: null, // Clear the token
            passwordResetExpires: null, // Clear expiry
        });
        
        console.log(`[DB SUCCESS] Password successfully reset for user ID: ${user.id}`);

        res.status(200).json({ 
            message: "Password successfully reset. You can now log in with your new password." 
        });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({
            message: "An internal server error occurred during password reset."
        });
    }
});


// --- 4. NOTIFICATION API LOGIC (Existing) ---

app.get('/', (req, res) => {
    res.status(200).send('Express and Socket.IO Server is running.');
});

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

app.post('/api/relay', (req, res) => {
    // 1. Get data from the Laravel request body (Sent from NotificationService.php)
    const { room, id, message, type } = req.body; 

    // Basic validation
    if (!room || !message) {
        return res.status(400).json({ error: 'Room and message are required in the body.' });
    }

    // 2. Broadcast the event to the specified room (e.g., 'user:2')
    // The event name 'new_notification' must match what useSocketNotifications.ts is listening for
    io.to(room).emit('new_notification', { id, message, type });

    console.log(`[NODE] Successfully relayed notification to room: ${room}`);

    // 3. Send a success response back to Laravel
    res.status(200).json({ success: true, broadcasted: true });
});

// 🔑 NEW: Check database connection before starting the server
sequelize.authenticate()
    .then(() => {
        console.log('✅ Database Connection has been established successfully.');
        // If the database is connected, start the server
        server.listen(SERVER_PORT, () => {
            console.log('--------------------------------------------------');
            console.log(`🚀 Combined Express/Socket.IO Server running on port ${SERVER_PORT}`);
            console.log(`CORS Policy allows: ${ALLOWED_ORIGIN}`);
            console.log('--------------------------------------------------');
        });
    })
    .catch(err => {
        console.error('❌ Unable to connect to the database:', err);
        console.error('Please check your .env DB settings (DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_DIALECT).');
        // Optionally exit the process if DB connection is critical
        // process.exit(1); 
    });