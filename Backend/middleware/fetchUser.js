const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const express = require("express");
const router = express.Router();


dotenv.config({ path: "../.env" });

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({
      msg: "You are not a authorized user",
    });
  }
  try {
    const isVerified = jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token timing has expired" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "invalid Token" });
        } else {
          return res.status(401).json({ message: err.name });
        }
      }
      console.log("Decoded payload:", decoded);
      // res.status(200).json({ message: "Token is valid", data: decoded })
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = fetchUser; 