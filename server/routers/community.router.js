const express = require("express");
const communityRouter = express.Router();
const communityController = require("../controllers/community.controller");
const communityValidation = require("../middlewares/validations/community.validation");
const {
    checkAuthentication,
} = require("../middlewares/authentication/checkAuthentication");


communityRouter.get("/communities/:id", checkAuthentication, communityController.findCommunityByID);

communityRouter.post("/communities", checkAuthentication,  communityValidation.community_checkEmpty, communityController.createCommunity);


module.exports = communityRouter;
