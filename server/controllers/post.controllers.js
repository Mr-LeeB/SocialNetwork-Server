const STATUS_CODE = require('../util/SettingSystem');
const postService = require('../services/post.service');

const upPost = async (req, res) => {
  // get id user from req
  const id = req.id;

  const { title, content, linkImage } = req.body;
  // const image = req.files?.image;

  const post = { title, content, linkImage };
  try {
    // Call service
    const result = await postService.upPost_Service(post, id);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.getPost_Service(id, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const getPostShare = async (req, res) => {
  const { id } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.getPostShare_Service(id, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const loadAllPost = async (req, res) => {
  const id = req.id;

  try {
    // Call service
    const result = await postService.loadAllPost_Service(id);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const editPost = async (req, res) => {
  const { id } = req.params;
  const { title, content, linkImage } = req.body;

  const post = { title, content, linkImage };

  const userID = req.id;

  try {
    // Call service
    const result = await postService.editPost_Service(id, post, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const getPostByUser = async (req, res) => {
  // Lấy bài viết của ownerID
  let { id: ownerID } = req.params;

  if (ownerID === 'me') {
    ownerID = req.id;
  }

  let callerID = req.id;

  try {
    // Call service bằng id của user
    const result = await postService.getPostByUser_Service(callerID, ownerID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const userID = req.id;

  try {
    // Call service
    const result = await postService.deletePost_Service(id, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const handleLikePost = async (req, res) => {
  const { id } = req.params;
  const userID = req.id;

  try {
    // Call service
    const result = await postService.handleLikePost_Service(id, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const handleSharePost = async (req, res) => {
  const { id } = req.params;
  const userID = req.id;

  try {
    // Call service
    const result = await postService.handleSharePost_Service(id, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const handleFavoritePost = async (req, res) => {
  const { id } = req.params;
  const userID = req.id;

  try {
    // Call service
    const result = await postService.handleFavoritePost_Service(id, userID);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const commentPost = async (req, res) => {
  const { id } = req.params;

  const { contentComment } = req.body;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.commentPost_Service(id, userID, contentComment);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const replyComment = async (req, res) => {
  const { id } = req.params;

  const { idComment } = req.params;

  const { contentComment } = req.body;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.replyComment_Service(id, userID, contentComment, idComment);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;

  const { idComment } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.deleteComment_Service(id, userID, idComment);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const handleLikePostShare = async (req, res) => {
  const { idShare } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.handleLikePostShare_Service(userID, idShare);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const commentPostShare = async (req, res) => {
  const { idShare } = req.params;

  const { contentComment } = req.body;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.commentPostShare_Service(userID, idShare, contentComment);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const replyCommentPostShare = async (req, res) => {
  const { idShare } = req.params;

  const { idComment } = req.params;

  const { contentComment } = req.body;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.replyCommentPostShare_Service(userID, idShare, contentComment, idComment);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const handleViewPost = async (req, res) => {
  const { postId } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.handleViewPost_Service(postId, userID, res, req);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const handleViewPostShare = async (req, res) => {
  const { postId } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await postService.handleViewPostShare_Service(postId, userID, res, req);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  upPost,
  getPost,
  loadAllPost,
  editPost,
  getPostByUser,
  deletePost,
  handleLikePost,
  handleSharePost,
  handleFavoritePost,
  commentPost,
  replyComment,
  deleteComment,
  handleLikePostShare,
  commentPostShare,
  replyCommentPostShare,
  getPostShare,
  handleViewPost,
  handleViewPostShare,
};
