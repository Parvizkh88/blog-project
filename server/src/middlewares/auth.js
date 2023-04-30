const jwt = require('jsonwebtoken');
const { dev } = require('../config');

const isLoggedIn = (req, res, next) => {
    try {
        // cookie here
        if (!req.headers.cookie) {
            return res.status(404).send({
                message: 'No cookie found'
            })
        }
        // token inside the cookie - extract the token
        const token = req.headers.cookie.split('=')[1]
        console.log(token);
        // verify token
        if (!token) {
            return res.status(404).send({
                message: 'No token found'
            });
        }

        jwt.verify(
            // this is the key to create and verify the token
            String(dev.app.jwtAuthorizationKey),
            // we also pass the token
            token,
            //The err parameter is an error object that will
            // be populated if the verification process fails,
            //and the user parameter is the decoded token payload.
            //If the verification process is successful, 
            //the code sets the req.id property to the decoded user.id 
            //value.This allows the user id to be accessed in subsequent
            // middleware or route handlers.
            async (err, user) => {
                if (err) {
                    return res.status(403).send({
                        message: 'invalid token'
                    });
                }
                // inside the request we are setting an id which 
                // is the decoded id (here I named it user id and I can name it whatever)
                req.id = user.id; // setting this id. so, in any controllerI have and id
                // of req.id that you can fetch the user from database
                next();
            }
        );

    } catch (error) {
        res.send({ message: error.message })
    }
};
module.exports = { isLoggedIn }