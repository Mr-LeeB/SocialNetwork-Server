const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/user.controllers');
const userValidation = require('../middlewares/validations/user.validation');
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');

userRouter.post('/users', userValidation.registerUser_checkEmpty, userController.registerUser);

userRouter.get('/users/:id', checkAuthentication, userController.findUserByID);

userRouter.put('/users/:id', checkAuthentication, userController.UpdateUser);

userRouter.post('/users/expertise', checkAuthentication, userController.Expertise);

userRouter.get('/user/followers', checkAuthentication, userController.getFollowed);

userRouter.post('/users/:id/follow', checkAuthentication, userController.followUser);

userRouter.get('/user/shouldFollow', checkAuthentication, userController.getShouldFollow);

userRouter.get('/user/github', checkAuthentication, userController.getRepositoryGithub);

module.exports = userRouter;
