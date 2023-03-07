const express = require('express');
const userRouter = express.Router()
const { RegisterUser_co } = require('../controllers/user.controllers')
const { RegisterUser_checkEmpty } = require('../middlewares/validations/user.validation')

// Thêm người dùng
userRouter.post('/', RegisterUser_checkEmpty, RegisterUser_co)


module.exports = userRouter;












