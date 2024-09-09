const { z } = require("zod");

const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

module.exports = {
  userSchema,
  loginSchema,
};
