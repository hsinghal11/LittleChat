const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const express = require("express");
const router = express.Router();


dotenv.config({ path: "../.env" });

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }
  
  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          return res.status(401).json({ message: err.name });
        }
      }
      
      // Store user ID in request for use in routes
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
      
      // If user-id header is not provided, use the one from the token
      if (!req.header("user-id")) {
        req.headers["user-id"] = decoded.userId;
      }
      
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = fetchUser; 