const User = require("../models/User");

const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

exports.postSignup = (req, res, next) => {
  const user = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  bcrypt.hash(user.password, 12).then((hashedPassword) => {
    const newUser = new User({
      email: user.email,
      password: hashedPassword,
      name: user.name,
    });

    newUser
      .save()
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        const error = new Error(err);
        error.statusCode = 500;
        next(error);
      });
  });
};

exports.postLogin = (req, res, next) => {
  const user = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  User.findOne({ email: user.email })
    .then((foundUser) => {
      bcrypt.compare(user.password, foundUser.password).then((result) => {
        res
          .status(200)
          .json({ email: foundUser.email, password: user.password });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });
};
