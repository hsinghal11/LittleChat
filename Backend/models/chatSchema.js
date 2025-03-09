const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  message_content: { 
    type: String, 
    required: true 
  },
  read_by: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "user" 
  }],
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const chatSchema = mongoose.Schema({
  name: {
    type: String,
    default: null // For group chats
  },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  ],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null // For group chats
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastMessage timestamp when a new message is added
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessage = Date.now();
  }
  next();
});

const chat = mongoose.model("chat", chatSchema);

module.exports = {
  chat,
};
