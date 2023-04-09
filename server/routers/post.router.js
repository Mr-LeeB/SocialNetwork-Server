const express = require("express");
const postRouter = express.Router();
const postController = require("../controllers/post.controllers");
const postValidation = require("../middlewares/validations/post.validation");
const {
  checkAuthentication,
} = require("../middlewares/authentication/checkAuthentication");

postRouter.post(
  "/posts",
  checkAuthentication,
  postValidation.post_checkEmpty,
  postController.upPost
);
/* postRouter.post("/posts/uploadImage", postController.uploadPostImage); */
postRouter.get("/posts/:id", checkAuthentication, postController.getPost);
postRouter.get("/:id/posts", checkAuthentication, postController.getPostByUser);
postRouter.get("/posts", checkAuthentication, postController.loadAllPost);
postRouter.put("/posts/:id", checkAuthentication, postController.editPost);
postRouter.delete("/posts/:id", checkAuthentication, postController.deletePost);

module.exports = postRouter;
