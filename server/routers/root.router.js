const express = require('express');
const router = express.Router();
const userRouter = require('./user.router');
const authRouter = require('./auth.router');
const postRouter = require('./post.router');
const conversationRouter = require('./conversation.router');
const messageRouter = require('./message.router');
const communityRouter = require('./community.router');
const notificationRouter = require('./notification.router');
const { pusherServer } = require('../config/pusher');
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');

router.use('/', userRouter);

router.use('/', authRouter);

router.use('/', postRouter);

router.use('/', conversationRouter);

router.use('/', messageRouter);

router.use('/', communityRouter);

router.use('/', notificationRouter);

router.post('/pusher/auth', checkAuthentication, async (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: req.id,
  };
  const auth = await pusherServer.authorizeChannel(socketId, channel, presenceData);
  res.send(auth);
});

module.exports = router;
