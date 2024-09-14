const express = require("express");
const dotenv = require("dotenv");
const { userSchema, loginSchema } = require("../validation/authSchema");
const { user } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
dotenv.config({ path: "../.env" });

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

router.post("/createUser", async (req, res) => {
  try {
    const createPayload = req.body;

    // Validating the input payload using Zod schema
    const parsedPayload = userSchema.safeParse(createPayload);
    if (!parsedPayload.success) {
      return res.status(400).json({
        msg: parsedPayload.error.errors[0].message,
      });
    }

    // Checking if the user already exists
    const existingUser = await user.findOne({ email: createPayload.email });
    if (existingUser) {
      return res.status(409).json({
        msg: "User already exists",
      });
    }

    // Hashing the password before saving to the database
    const hashedPassword = await bcrypt.hash(createPayload.password, 12);

    // Creating the new user
    const newUser = await user.create({
      name: createPayload.name,
      email: createPayload.email,
      password: hashedPassword,
    });

    // Generating a JWT token after successful user creation
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Returning the token and user information to the client
    res.status(201).json({
      msg: "User created successfully",
      token: token, 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    const loginPayload = req.body;

    // Validate the input payload using Zod schema
    const parsedPayload = loginSchema.safeParse(loginPayload);
    if (!parsedPayload.success) {
      return res.status(400).json({
        msg: parsedPayload.error.errors[0].message,
      });
    }

    // Checking if the user does not exists
    const existingUser = await user.findOne({ email: loginPayload.email });
    if (!existingUser) {
      return res.status(404).json({
        msg: "User does not exist",
      });
    }

    // Comparing the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(
      loginPayload.password, // Plaintext password
      existingUser.password // Hashed password from the database
    );
    if (!isMatch) {
      return res.status(401).json({
        msg: "Password is incorrect",
      });
    }

    // Generating a JWT token after successful authentication
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Returning the token and user information to the client
    res.status(200).json({
      msg: "User logged in successfully",
      token: token, 
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
});

module.exports = router;
