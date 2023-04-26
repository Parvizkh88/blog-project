// const fs = require('fs');
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        console.log(req.body);
        console.log(req.file);

        res.status(200).json({ message: 'email was sent' })
    } catch (error) {
        res.json({
            message: error.message
        });
    }
};

module.exports = { registerUser }