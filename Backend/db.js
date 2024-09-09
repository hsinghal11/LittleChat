const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoURL = `${process.env.MONGODB_URL}`;

const connectToMongo = () => {
  mongoose.connect(mongoURL).then(console.log("connected with mongoose"));
};

module.exports = connectToMongo;
