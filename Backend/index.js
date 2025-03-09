const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectToMongo = require("./db");
const jwt = require("jsonwebtoken");
const { user } = require("./models/userSchema");
const { chat } = require("./models/chatSchema");

// Connect to MongoDB
connectToMongo();
const port = process.env.PORT || 4000;

// Initialize Express app
const app = express();
app.use(cors({
  origin: ["https://little-chat-front.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["https://little-chat-front.vercel.app", "http://localhost:5173"], // Allow both deployed frontend and local development
    methods: ["GET", "POST"],
    credentials: true
  },
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Socket.io middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  if (!token) {
    return next(new Error("Authentication token is required"));
  }

  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Socket auth error:", err.message);
        return next(new Error("Invalid token"));
      }
      
      // Store user info in socket object
      socket.userId = userId || decoded.userId;
      socket.userEmail = decoded.email;
      
      console.log(`Socket authenticated for user: ${socket.userId}`);
      next();
    });
  } catch (error) {
    console.error("Socket authentication error:", error);
    return next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a chat room
  socket.on("join_room", async (roomId) => {
    if (!roomId) {
      console.error("Invalid room ID:", roomId);
      return;
    }
    
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    try {
      // Verify the chat exists and user is a participant
      const chatDoc = await chat.findById(roomId);
      if (!chatDoc) {
        console.error(`Chat not found: ${roomId}`);
        return;
      }
      
      if (socket.userId && !chatDoc.participants.includes(socket.userId)) {
        console.error(`User ${socket.userId} is not a participant in chat ${roomId}`);
        socket.leave(roomId);
        return;
      }
    } catch (error) {
      console.error(`Error verifying chat ${roomId}:`, error);
    }
  });

  // Handle new messages
  socket.on("send_message", (data) => {
    if (!data || !data.room || !data.message) {
      console.error("Invalid message data:", data);
      return;
    }
    
    console.log(`Message received in room ${data.room}:`, data);
    
    // Ensure sender_id is set correctly
    if (!data.message.sender_id && socket.userId) {
      data.message.sender_id = socket.userId;
    }
    
    // Broadcast the message to everyone in the room except the sender
    socket.to(data.room).emit("receive_message", data);
  });

  // Handle user typing status
  socket.on("typing", (data) => {
    if (!data || !data.room) {
      console.error("Invalid typing data:", data);
      return;
    }
    
    // Ensure userId is set correctly
    if (!data.userId && socket.userId) {
      data.userId = socket.userId;
    }
    
    console.log(`Typing status in room ${data.room}:`, data);
    socket.to(data.room).emit("user_typing", data);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/users", require("./routes/users"));
app.use("/api/protection", require("./routes/protectionToken"));

app.get("/", (req, res) => {
  res.send("LittleChat API is running");
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
