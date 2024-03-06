const express = require("express");

const authController = require("../controllers/auth");

const User = require("../models/User");

const { check } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email must not be empty")
      .isEmail()
      .withMessage("Invalid Email")
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already exist");
          }
        });
      }),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password must not be empty")
      .isLength({ min: 8 })
      .isAlphanumeric()
      .withMessage(
        "Password must atleast 8 characters and contain numbers and letters only"
      ),
  ],
  authController.postSignup
);

router.post(
  "/login",
  [
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email must not be empty")
      .isEmail()
      .withMessage("Invalid Email")
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("Email doesn't exist");
          }
        });
      }),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password must not be empty")
      .isLength({ min: 8 })
      .isAlphanumeric()
      .withMessage(
        "Password must atleast 8 characters and contain numbers and letters only"
      ),
  ],
  authController.postLogin
);

module.exports = router;
