const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

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
    const isVerified = jwt.verify(token,JWT_SECRET, (err, de));
    
  } catch (error) {
    
  }
};
