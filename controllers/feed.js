const { validationResult } = require("express-validator");

const fileHelper = require("../ultilities/file");
const path = require("path");

const io = require("../socket");

const User = require("../models/User");
const Post = require("../models/Post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .populate("user")
    // sort theo moi nhat
    .sort({ date: -1 })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });
};

exports.createPost = (req, res, next) => {
  const email = req.body.author;
  const title = req.body.title;
  const imgUrl = req.file;
  const content = req.body.content;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  User.findOne({ email: email })
    .then((userData) => {
      const newPost = new Post({
        title: title,
        img: imgUrl.path,
        content: content,
        date: new Date(),
        user: userData._id,
      });

      newPost.save().then((result) => {
        // Lab 22.1
        io.getIO().emit("posts", {
          action: "create",
          post: {
            ...result._doc,
            user: { _id: userData._id, name: userData.name },
          },
        });
        res.status(201).json(result);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });
};

exports.getPostById = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });
};

exports.editPost = (req, res, next) => {
  const postId = req.params.postId;
  const updatedTitle = req.body.title;
  const updatedImg = req.file;
  const updatedContent = req.body.content;

  Post.findById(postId)
    .populate("user")
    .then((post) => {
      post.title = updatedTitle;
      if (updatedImg) {
        fileHelper.deleteFile(
          path.join(
            path.dirname(require.main.filename),
            "images",
            post.img.split("\\")[1]
          )
        );
        post.img = updatedImg.path;
      }
      post.content = updatedContent;

      return post.save().then((result) => {
        io.getIO().emit("posts", { action: "update", post: result });
        res.status(200).json(result);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      fileHelper.deleteFile(
        path.join(
          path.dirname(require.main.filename),
          "images",
          post.img.split("\\")[1]
        )
      );
      Post.findByIdAndDelete(postId).then((result) => {
        // Lab 22.2
        io.getIO().emit("posts", { action: "delete", post: postId });
        res.sendStatus(200);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });
};
