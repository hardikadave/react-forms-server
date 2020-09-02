const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { MONGODB } = require("./config");
const app = express();
app.use(bodyParser.json());
const User = require("./models/User");

const PORT = 5000;

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((error) => console.log(error));
mongoose.connection.once("open", () => console.log("mongodb connected"));

app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

app.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  let errors = {};
  if (username.trim() === "") {
    errors.username = "Username cannot be empty";
  }
  if (email.trim() === "") {
    errors.email = "Email cannot be empty";
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be valid";
    }
  }
  if (password === "") {
    errors.password = "Password cannot be empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Password should match";
  }

  if (Object.keys(errors).length > 0) {
    res.json({ error: errors });
  } else {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.json({ error: { email: "Email already in use!" } });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();

    res.json(result);
  }
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
