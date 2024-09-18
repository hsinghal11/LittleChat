const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();

router.post("/checktoken", fetchUser, (req, res) => {
  try {
    return res.status(200).json({
      message: "token is valid",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;