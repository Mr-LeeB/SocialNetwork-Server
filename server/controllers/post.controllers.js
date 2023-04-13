const STATUS_CODE = require("../util/SettingSystem");
const postService = require("../services/post.service");

const upPost = async (req, res) => {
  // get id user from req
  const id = req.id;

  const { title, content } = req.body;
  const image = req.files?.image;

  // Check if post have image
  if (!image) {
    const post = { title, content };
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
      res
        .status(STATUS_CODE.SERVER_ERROR)
        .send({ success: false, message: "Internal server error" });
    }
  }
  // If post have image
  else {
    const imageContent = Buffer.from(req.files.image.data, "binary");
    const imageName = req.files.image.name;
    const imageType = req.files.image.mimetype;
    const imageSize = req.files.image.size;
    try {
      // Call service
      const imageUpload = await postService.uploadPostImage_Service(
        imageName,
        imageContent,
        imageType,
        imageSize
      );
      const imageLink = imageUpload.content;
      const post = { title, content, linkImage: imageLink };
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
      res
        .status(STATUS_CODE.SERVER_ERROR)
        .send({ success: false, message: "Internal server error" });
    }
  }
};

/* const uploadPostImage = async (req, res) => {
  const imageContent = Buffer.from(req.files.image.data, "binary");
  const imageName = req.files.image.name;
  const imageType = req.files.image.mimetype;
  const imageSize = req.files.image.size;

  try {
    // Call service
    const result = await postService.uploadPostImage_Service(
      imageName,
      imageContent,
      imageType,
      imageSize
    );
    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
}; */

const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    // Call service
    const result = await postService.getPost_Service(id);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const loadAllPost = async (req, res) => {
  try {
    // Call service
    const result = await postService.loadAllPost_Service();

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const editPost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const post = { title, content };

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
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const getPostByUser = async (req, res) => {
  // Lấy bài viết của ownerID
  let { id: ownerID } = req.params;

  if (ownerID === "me") {
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
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
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
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
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
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
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
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
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
};
