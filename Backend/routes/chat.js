const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const { chatSchema } = require("../validation/chatSchema");
const { user } = require("../models/userSchema");
const { chat } = require("../models/chatSchema");
const mongoose = require("mongoose");
const router = express.Router();

// Get all chats for a user
router.get("/user-chats", fetchUser, async (req, res) => {
  try {
    const userId = req.header("user-id");
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    // Find all chats where the user is a participant
    const userChats = await chat.find({
      participants: { $in: [userId] },
    }).populate("participants", "name email");

    return res.status(200).json({
      message: "Chats retrieved successfully",
      chats: userChats,
    });
  } catch (error) {
    console.error("Error retrieving chats:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get or create a chat between participants
router.post("/get-or-create", fetchUser, async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({
        message: "At least two valid participant IDs are required",
      });
    }

    // Validate that all participant IDs are valid ObjectIds
    const invalidParticipants = participants.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidParticipants.length > 0) {
      return res.status(400).json({
        message: "Some participant IDs have invalid format",
        invalidParticipants
      });
    }

    // Verify all participants exist
    const usersInDb = await user.find({ _id: { $in: participants } });
    
    // Check if all participants exist
    if (usersInDb.length !== participants.length) {
      // Find which participants don't exist
      const existingUserIds = usersInDb.map(u => u._id.toString());
      const nonExistentParticipants = participants.filter(p => !existingUserIds.includes(p));
      
      return res.status(400).json({
        message: "Some participants are invalid or do not exist",
        invalidParticipants: nonExistentParticipants
      });
    }

    // Find existing chat or create a new one
    let existingChat = await chat.findOne({
      participants: { $all: participants, $size: participants.length },
    }).populate("participants", "name email avatar status");

    if (existingChat) {
      return res.status(200).json({
        message: "Existing chat found",
        chat: existingChat,
      });
    } else {
      const newChat = new chat({ participants, messages: [] });
      await newChat.save();
      
      // Populate the participants in the new chat
      const populatedChat = await chat.findById(newChat._id)
        .populate("participants", "name email avatar status");

      return res.status(201).json({
        message: "New chat created",
        chat: populatedChat,
      });
    }
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Add a message to a chat
router.post("/add-message", fetchUser, async (req, res) => {
  try {
    const { chatId, message } = req.body;
    
    if (!chatId || !message || !message.sender_id || !message.message_content) {
      return res.status(400).json({
        message: "Chat ID, sender ID, and message content are required",
      });
    }

    // Validate that chatId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        message: "Invalid chat ID format",
      });
    }

    // Validate that sender_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(message.sender_id)) {
      return res.status(400).json({
        message: "Invalid sender ID format",
      });
    }

    // Find the chat and add the message
    const updatedChat = await chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: message } },
      { new: true }
    ).populate("participants", "name email");

    if (!updatedChat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      message: "Message added successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Legacy endpoint for backward compatibility
router.post("/showchats", fetchUser, async (req, res) => {
  try {
    const chatsPayload = req.body;
    const parsedPayload = chatSchema.safeParse(chatsPayload);
    if (!parsedPayload.success) {
      return res.status(400).json({
        message: parsedPayload.error.errors[0].message,
      });
    }

    const { participants, messages } = chatsPayload;
    
    // Validate that all participant IDs are valid ObjectIds
    const invalidParticipants = participants.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidParticipants.length > 0) {
      return res.status(400).json({
        message: "Some participant IDs have invalid format",
        invalidParticipants
      });
    }
    
    const usersInDb = await user.find({ _id: { $in: participants } });
    if (usersInDb.length !== participants.length) {
      return res.status(400).json({
        message: "Some participants are invalid or do not exist.",
      });
    }

    const existingChat = await chat.findOne({
      participants: { $all: participants, $size: participants.length },
    });

    if (existingChat) {
      if (messages && messages.length > 0) {
        existingChat.messages.push(...messages);
        await existingChat.save();
      }

      return res.status(200).json({
        message: "previous chat",
        chat: existingChat,
      });
    } else {
      const newChat = new chat({ participants, messages: messages || [] });
      await newChat.save();

      return res.status(200).json({
        message: "new chat",
        chat: newChat,
      });
    }
  } catch (error) {
    console.error("Error in showchats:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
