const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoURL = "mongodb://localhost:27017/littleChat" ;

const connectToMongo = () => {
  mongoose
    .connect(mongoURL)
    .then(console.log(`connected with mongoose ${mongoURL}`));
};


module.exports = connectToMongo;
