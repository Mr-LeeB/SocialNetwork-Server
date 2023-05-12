const express = require('express');
const router = express.Router();
const userRouter = require("./user.router");
const authRouter = require("./auth.router");
const postRouter = require("./post.router");

router.use('/', conversationRouter);

router.use('/', messageRouter);

router.post('/pusher/auth', checkAuthentication, (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: req.id,
  };
  const auth = pusherServer.authorizeChannel(socketId, channel, presenceData);
  res.send(auth);
});

router.use("/", conversationRouter);

router.use("/", messageRouter);

module.exports = router;
