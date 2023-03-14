const express = require("express");
const router = express.Router();
const userRouter = require("./user.router");
const authRouter = require("./auth.router");

router.use("/", userRouter);

//check access token
router.use("/", authRouter);

module.exports = router;
