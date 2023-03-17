const express = require("express");
const router = express.Router();
const userRouter = require("./user.router");
const authRouter = require("./auth.router");
const postRouter = require("./post.router");

router.use("/", userRouter);

router.use("/", authRouter);

router.use("/", postRouter);

module.exports = router;
