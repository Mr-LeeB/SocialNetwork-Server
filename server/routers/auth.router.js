const express = require("express");
const authRouter = express.Router();
const { checkLoginBefore } = require("../controllers/auth.controllers");
const { checkToken } = require("../middlewares/validations/auth.validation");

authRouter.post("/checkLoginBefore", checkToken, checkLoginBefore);

module.exports = authRouter;
