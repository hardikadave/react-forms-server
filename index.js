const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { MONGODB } = require("./config");
const { register, login } = require("./handlers/User");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((error) => console.log(error));
mongoose.connection.once("open", () => console.log("MongoDB Connected"));

// user
app.post("/register", register);
app.post("/login", login);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
