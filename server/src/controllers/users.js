const { errorResponse, successResponse } = require("../utils/responsehandler");
const createError = require('http-errors');
const User = require("../models/users");
const { securePassword } = require("../utils/password");
const { dev } = require("../config");
const { sendEmailWithNodeMailer } = require("../utils/email");
const { createJsonWebToken, verifyJsonWebToken } = require('../utils/token');


// const fs = require('fs');
const registerUser = async (req, res, next) => {
    try {
        // step 1: get the data from request
        const { name, email, password, phone } = req.body;

        // when we are throwing any error the catch will handle it
        //  and catch will call the next middleware
        if (!name || !email || !password || !phone) throw createError(404,
            'name, email, password or phone is missing');
        if (password.length < 6) throw createError(400,
            'password length should be at least 6 characters');

        const image = req.file;
        if (image && image.size > Math.pow(1024, 1024))
            throw createError(400,
                'file is too large. It must be less than 1 mb in size');

        // step 3: check the user already exiswt or not
        const user = await User.findOne({ email });
        if (user) throw createError(
            400,
            'user with this email already exists. Please sign in'
        );

        const hashedPassword = await securePassword(password);
        // step 4: create a token  for storing data temporarily
        let token;
        //The code checks if there is an "image" property in the "req.body" object.
        //  If there is, it adds the path to an image to the JWT, 
        // along with some other data from "req.body". 
        // If there is no "image" property, it still creates a JWT but without the image path.
        if (image) {
            token = createJsonWebToken({
                ...req.body,
                password: hashedPassword,
                image: image.path
            }, dev.app.jwtAccountActivationKey, '1m');
        } else {
            token = createJsonWebToken({
                ...req.body,
                password: hashedPassword
            }, dev.app.jwtAccountActivationKey, '1m'
            );
        }
        //step 5: prepare email data including jwt token
        const emailData = {
            email,
            subject: "Account Activation Email",
            html: `
            <h2>Hello ${name}! </h2>
            <p>Please click here to <a href="${dev.app.clientUrl}/api/users/activate?token=${token}" target="_blank">activate your account</a> </p>
            `,
        };
        // step 6: send verification email
        sendEmailWithNodeMailer(emailData);

        return successResponse(res, 200, `Please go to your email: ${email} for completing your registration`, { token: token });
    } catch (error) {
        next(error)
    };
}

module.exports = { registerUser }

