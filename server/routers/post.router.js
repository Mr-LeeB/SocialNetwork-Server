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
postRouter.post(
  "/posts/:id/like",
  checkAuthentication,
  postController.handleLikePost
);
postRouter.post(
  "/posts/:id/share",
  checkAuthentication,
  postController.handleSharePost
);
postRouter.post(
  "/posts/:id/save",
  checkAuthentication,
  postController.handleFavoritePost
);

module.exports = postRouter;
