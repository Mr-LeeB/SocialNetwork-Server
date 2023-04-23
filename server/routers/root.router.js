const express = require("express");
const router = express.Router();
const userRouter = require("./user.router");
const authRouter = require("./auth.router");
const postRouter = require("./post.router");
const conversationRouter = require("./conversation.router");
const messageRouter = require("./message.router");


router.use("/", userRouter);

router.use("/", authRouter);

router.use("/", postRouter);

router.use("/", conversationRouter);

router.use("/", messageRouter);

module.exports = router;
