const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const { user } = require("../models/userSchema");
const mongoose = require("mongoose");
const router = express.Router();

// Get all users (except the current user)
router.get("/all", fetchUser, async (req, res) => {
  try {
    const currentUserId = req.header("user-id");
    if (!currentUserId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Validate that currentUserId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    const users = await user.find({ _id: { $ne: currentUserId } })
      .select("-password"); // Exclude password field

    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get user by ID
router.get("/:id", fetchUser, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }
    
    const userData = await user.findById(userId)
      .select("-password"); // Exclude password field
    
    if (!userData) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update user status
router.put("/status", fetchUser, async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({
        message: "User ID and status are required",
      });
    }

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    // Validate status
    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'online', 'offline', or 'away'",
      });
    }

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      { 
        status,
        lastSeen: status === 'offline' ? Date.now() : undefined
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Search users by name or email
router.get("/search/:query", fetchUser, async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const currentUserId = req.header("user-id");

    if (!searchQuery) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    // Validate that currentUserId is a valid ObjectId if provided
    if (currentUserId && !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    console.log(`Searching for users with query: "${searchQuery}", current user: ${currentUserId}`);

    // Build the query based on whether currentUserId is valid
    let query = {};
    
    if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
      query = {
        $and: [
          { _id: { $ne: currentUserId } }, // Exclude current user
          {
            $or: [
              { name: { $regex: searchQuery, $options: "i" } }, // Case-insensitive name search
              { email: { $regex: searchQuery, $options: "i" } }, // Case-insensitive email search
            ],
          },
        ],
      };
    } else {
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const users = await user.find(query).select("-password");

    console.log(`Found ${users.length} users matching the search query`);

    return res.status(200).json({
      message: "Users found",
      users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router; 