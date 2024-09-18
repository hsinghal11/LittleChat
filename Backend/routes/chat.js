const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const { chatSchema } = require("../validation/chatSchem");
const { user } = require("../models/userSchema");
const { chat } = require("../models/chatSchema");
const router = express.Router();

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
    const usersIndb = await user.find({ _id: { $in: participants } });
    // console.log(usersIndb);
    if (usersIndb.length != participants.length) {
      return res.status(400).json({
        message: "Some participants are invalid or do not exist.",
      });
    }

    const ExistingChat = await chat.findOne({
      participants: { $all: participants },
    });

    if (ExistingChat) {
      ExistingChat.messages.push(...messages);
      await ExistingChat.save();
    //   console.log(ExistingChat);

      return res.status(200).json({
        message: "previous chat",
        chat: ExistingChat,
      });
    } else {
      const newChat = new chat({ participants, messages });
      await newChat.save();
    //   console.log(newChat);

      return res.status(200).json({
        message: "new chat",
        chat: newChat,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
