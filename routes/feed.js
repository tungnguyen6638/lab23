const express = require("express");

const { check } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedController.getPosts);

router.post(
  "/posts",
  [
    check("title", "Title must not be empty and have atleast 3 characters")
      .not()
      .isEmpty()
      .isLength({ min: 3 })
      .trim(),
    check("content", "Content must not be empty")
      .isString()
      .isLength({ min: 3 })
      .trim(),
  ],
  feedController.createPost
);

router.get("/single-post/:postId", feedController.getPostById);

router.put("/edit-post/:postId", feedController.editPost);

router.delete("/delete-post/:postId", feedController.deletePost);

module.exports = router;
