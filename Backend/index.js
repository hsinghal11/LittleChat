const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const cors = require("cors");
const connectToMongo = require("./db");
connectToMongo();
const port = 4000;

const app = express();
app.use(cors());
app.use(express.json());

//Authentication
app.use("/api/auth", require("./routes/auth"));

//Chat
app.use("/api/chat", require("./routes/chat"))

app.use("/api/protection", require("./routes/protectionToken"))

app.get("/", (req, res) => {
  res.send("Ya working");
});

app.listen(port, () => {
  console.log(`We are listing on ${port}`);
});
