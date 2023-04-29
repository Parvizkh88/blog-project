const { errorResponse, successResponse } = require("../utils/responsehandler");
const createError = require('http-errors');
const User = require("../models/users");
const { securePassword, comparedPassword } = require("../utils/password");
const { dev } = require("../config");
const { sendEmailWithNodeMailer } = require("../utils/email");
const { createJsonWebToken } = require('../utils/token');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require("mongoose");

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
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw createError(404, 'email or password not found ')
        };

        if (password.length < 6) {
            throw createError(400, 'minimum length for password is 6');
        }

        const user = await User.findOne({ email })
        if (!user) {
            throw createError(404, 'user with this email does not exist. Please register first')
        }

        const isPasswordMatched = await comparedPassword(password, user.password)
        // console.log(user.password);
        // console.log(password);

        if (!isPasswordMatched) {
            throw createError(400, 'email/password did not match');
        }
        if (user.isBanned) {
            throw createError(204, 'You are banned. Please contact the authority');
        }

        // token base authentication

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user.image,
        }
        return successResponse(res, 200, 'user was logged in', {
            user: userData,
        });
    } catch (error) {
        next(error)
    }
};

const verifyUser = async (req, res, next) => {
    try {
        // step 1: get token 
        const token = req.body.token;

        // step 2: check token exist in request body
        if (!token) throw createError(404, 'token not found');

        // step 3: verify token and decode data
        const decoded = jwt.verify(token, String(dev.app.jwtAccountActivationKey));

        // step 4: create the user - so, we will receive the data from decoded
        const newUser = new User({ ...decoded });
        // second way for the code: const {name, email} = decoded

        // step 5: save the user
        const user = await newUser.save();

        // step 6: send the response
        if (!user) throw createError(400, 'user was not found');

        return successResponse(res, 201, 'user was created successfully! Please signin');
    } catch (error) {
        next(error);
    }
}

const findUser = async (req, res, next) => {
    try {
        //const id = req.params.id; is better than
        // const id = req.params; because req.params is an object containing
        // a property for each route parameter, whereas req.params.id 
        //only returns the value of the id parameter.
        const id = req.params.id;
        console.log(typeof id);
        const user = await User.findById(id);
        if (!user) throw createError(404, 'user was not found');
        return successResponse(res, 201, 'user was returned successfully!',
            { user: user }); //if we find the user then we can send it as a 
        //response:{user: user}
    } catch (error) {
        //If the error is indeed a CastError, it means that the id 
        //parameter in the request was not valid and couldn't be 
        //converted to the type required by MongoDB (e.g., ObjectId). 
        //In this case, the catch block generates a new error using 
        //createError from the http-errors library with a status code 
        //of 400 (Bad Request) and a message of 'invalid id'. Then, 
        //it passes this new error to the next middleware function 
        //using next, effectively stopping the execution of the current middleware.
        //On the other hand, if the error is not a CastError, 
        //it means that it was caused by something else, such as a 
        //server error, database error, or some other issue.In this case, 
        //the catch block simply passes the original error to the next middleware 
        //function without modifying it, allowing it to be handled by the next error 
        //- handling middleware.
        if (error instanceof mongoose.Error.CastError) {
            next(createError(400, 'invalid id'));
            return
        }
        next(error);
    }
}
module.exports = { registerUser, verifyUser, findUser, loginUser }

