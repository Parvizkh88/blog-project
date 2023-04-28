const jwt = require('jsonwebtoken');

const createJsonWebToken = (data, key, expiresIn) => {
    return jwt.sign(
        {
            ...data
        },
        String(key),
        {
            expiresIn: expiresIn
        }
    );
};
const verifyJsonWebToken = (res, token, key) => {
    try {
        return jwt.verify(token, String(key))
    } catch (error) {
        return res.json({
            error: error.message
        });
    }
}
module.exports = {
    createJsonWebToken,
    verifyJsonWebToken
};
