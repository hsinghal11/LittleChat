const express = require("express");
const { userSchema } = require("../validation/userSchema");
const { user, user } = require("../models/user");
const router = express.Router();

router.post("/createUser", async (req, res) => {
  try {
    const createPayload = req.body;
    const parsedPayload = userSchema.safeParse(createPayload);
    if (!parsedPayload.success) {
      res.status(411).json({
        msg: parsedPayload.error.message,
      });
      return;
    }

    let user = await user.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).json({
        msg: "User is already exist"
      });
    }

    await user.create({
        name: createPayload.name,
        email: createPayload.email,

    })
  } catch (error) {}
});
