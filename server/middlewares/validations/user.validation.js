const STATUS_CODE = require('../../util/SettingSystem');


const RegisterUser_checkEmpty = (req, res, next) => {
    const { userName, passWord } = req.body;

    // Simple validation
    if (!userName || !passWord) {
        return res.status(STATUS_CODE.BAD_REQUEST).send({ success: false, message: 'Missing username and/or password' });
    }
    next();
}


module.exports = {
    RegisterUser_checkEmpty
}

















