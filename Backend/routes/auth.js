const express = require("express");
const dotenv = require("dotenv");
const { userSchema, loginSchema } = require("../validation/authSchema");
const { user } = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
dotenv.config({ path: "../.env" });

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const createPayload = req.body;

    // Validating the input payload using Zod schema
    const parsedPayload = userSchema.safeParse(createPayload);
    if (!parsedPayload.success) {
      return res.status(400).json({
        message: parsedPayload.error.errors[0].message,
      });
    }

    // Checking if the user already exists
    const existingUser = await user.findOne({ email: createPayload.email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hashing the password before saving to the database
    const hashedPassword = await bcrypt.hash(createPayload.password, 12);

    // Creating the new user
    const newUser = await user.create({
      name: createPayload.name,
      email: createPayload.email,
      password: hashedPassword,
      status: 'online',
      lastSeen: Date.now()
    });

    // Generating a JWT token after successful user creation
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Returning the token and user information to the client
    res.status(201).json({
      message: "User created successfully",
      token: token, 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        status: newUser.status
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  try {
    const loginPayload = req.body;

    // Validate the input payload using Zod schema
    const parsedPayload = loginSchema.safeParse(loginPayload);
    if (!parsedPayload.success) {
      return res.status(400).json({
        message: parsedPayload.error.errors[0].message,
      });
    }

    // Checking if the user exists
    const existingUser = await user.findOne({ email: loginPayload.email });
    if (!existingUser) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    // Comparing the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(
      loginPayload.password,
      existingUser.password
    );
    if (!isMatch) {
      return res.status(401).json({
        message: "Password is incorrect",
      });
    }

    // Update user status to online
    existingUser.status = 'online';
    await existingUser.save();

    // Generating a JWT token after successful authentication
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Returning the token and user information to the client
    res.status(200).json({
      message: "User logged in successfully",
      token: token, 
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        avatar: existingUser.avatar,
        status: existingUser.status
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Logout a user
router.post("/logout", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update user status to offline and set lastSeen
    await user.findByIdAndUpdate(userId, {
      status: 'offline',
      lastSeen: Date.now()
    });
    
    res.status(200).json({
      message: "User logged out successfully"
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Get current user profile
router.get("/profile", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userData = await user.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: userData
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
