const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoURL = process.env.MONGODB_URI;

const connectToMongo = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log(`Connected to MongoDB at ${mongoURL}`))
    .catch(err => console.error("MongoDB connection error:", err));
};

module.exports = connectToMongo;
