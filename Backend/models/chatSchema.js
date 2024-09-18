const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  participants: [
    { type: mongoose.Schema.ObjectId, ref: "user", required: true },
  ],
  messages: [
    {
      sender_id: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
      },
      message_content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const chat = mongoose.model("chat", chatSchema);
module.exports = {
  chat,
};
