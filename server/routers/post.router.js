const express = require("express");
const postRouter = express.Router();
const postController = require("../controllers/post.controllers");
const postValidation = require("../middlewares/validations/post.validation");
const { post } = require("./auth.router");

postRouter.post(
  "/posts",
  postValidation.post_checkEmpty,
  postController.upPost
);
postRouter.get("/posts/:id", postController.getPost);
postRouter.get("/:id/posts", postController.getPostByUser);
postRouter.get("/posts", postController.load10Post);
postRouter.put("/posts/:id", postController.editPost);

module.exports = postRouter;
