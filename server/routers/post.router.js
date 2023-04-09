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
/* postRouter.post("/posts/uploadImage", postController.uploadPostImage); */
postRouter.get("/posts/:id", postController.getPost);
postRouter.get("/:id/posts", postController.getPostByUser);
postRouter.get("/posts", postController.loadAllPost);
postRouter.put("/posts/:id", postController.editPost);
postRouter.delete("/posts/:id", postController.deletePost);

module.exports = postRouter;
