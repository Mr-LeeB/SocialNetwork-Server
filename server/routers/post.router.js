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
postRouter.get("/posts/:id", checkAuthentication, postController.getPost);
postRouter.get(
  "/postshares/:id",
  checkAuthentication,
  postController.getPostShare
);
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

postRouter.post(
  "/posts/:id/comment",
  checkAuthentication,
  postController.commentPost
);

postRouter.post(
  "/posts/:id/comment/:idComment",
  checkAuthentication,
  postController.replyComment
);

postRouter.delete(
  "/posts/:id/comment/:idComment",
  checkAuthentication,
  postController.deleteComment
);

postRouter.post(
  "/postshare/:idShare/like",
  checkAuthentication,
  postController.handleLikePostShare
);

postRouter.post(
  "/postshare/:idShare/comment",
  checkAuthentication,
  postController.commentPostShare
);

postRouter.post(
  "/postshare/:idShare/comment/:idComment",
  checkAuthentication,
  postController.replyCommentPostShare
);

postRouter.post(
  "/posts/:postId/views",
  checkAuthentication,
  postController.handleViewPost
)

postRouter.post(
  "/postshare/:postId/views",
  checkAuthentication,
  postController.handleViewPostShare
)


module.exports = postRouter;
