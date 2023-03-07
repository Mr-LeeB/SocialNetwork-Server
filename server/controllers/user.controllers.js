const { RegisterUser_se } = require('../services/user.services');

// @route POST api/users
// @desc Register user
// @access Public 

const RegisterUser_co = async (req, res) => {
    const { userName, passWord } = req.body;

    const user = { userName, passWord }

    try {
        // Call service
        const result = await RegisterUser_se(user);

        // Return result
        const { status, success, message, data } = result;
        if (!success) {
            return res.status(status).send({ success, message });
        } else {
            return res.status(status).send({ success, message, data });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
}


module.exports = {
    RegisterUser_co
}