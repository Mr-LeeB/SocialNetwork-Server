const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controllers');
const authValidation = require('../middlewares/validations/auth.validation');
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');

authRouter.post('/login', authValidation.login_checkEmpty, authController.login);

authRouter.post('/checklogin', checkAuthentication, authController.checkLogin);

authRouter.get('/auth/google', authController.login_Google);

authRouter.get('/auth/google/callback', authValidation.login_validation_Google, authController.login_Google_Callback);

authRouter.post('/auth/googleV2', authController.login_GoogleV2);

authRouter.get('/auth/github', authController.login_Github);

authRouter.post('/logout', checkAuthentication, authController.logout);

authRouter.post('/forgot', authValidation.checkEmail_Empty, authController.forgot_password);

authRouter.post('/verify', authController.verify_code);

authRouter.post('/checkVerify', authController.checkVerify);

authRouter.post('/reset', authValidation.checkPassword_Empty, authController.reset_password);

authRouter.post('/checkReset', authController.checkReset);

authRouter.get('/getUserID', checkAuthentication, authController.getUserID);

module.exports = authRouter;
