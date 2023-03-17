const express = require("express");
const postRouter = express.Router();
const postController = require("../controllers/post.controllers");
const postValidation = require("../middlewares/validations/post.validation");

postRouter.post(
  "/posts",
  postValidation.post_checkEmpty,
  postController.upPost
);
postRouter.get("/posts/:id", postController.getPost);
postRouter.get("/posts", postController.load10Post);
postRouter.put("/posts/:id", postController.editPost);

module.exports = postRouter;
