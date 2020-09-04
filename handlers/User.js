const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

exports.register = async (req, res) => {
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
    return res.status(400).json({ error: errors });
  } else {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: { email: "Email already in use!" } });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();

    return res.status(200).json(result);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  let errors = {};
  if (email.trim() === "") {
    errors.email = "Email cannot be empty";
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email is not valid";
    }
  }

  if (password.trim() === "") {
    errors.password = "Password cannot be empty";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: errors });
  } else {
    const existingUser = await User.findOne({ email }); //finding the document in the users collection based on email
    if (!existingUser) {
      //catch (err) {
      // console.log(err);
      return res.status(400).json({ error: { email: "Email does not exist" } });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res
        .status(403)
        .json({ error: { password: "Password does not match" } });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ email, token });
  }
};
