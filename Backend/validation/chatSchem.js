const z = require("zod");

const messageSchema = z.object({
  sender_id: z.string(),
  message_content: z.string().min(1, "Message content cannot be empty"),
  timestamp: z.date().optional(),
});

const chatSchema = z.object({
  participants: z.array(z.string()).min(2, "there should be atleast 2 participants"),
  messages: z.array(messageSchema),
});

module.exports = {
  chatSchema,
};
