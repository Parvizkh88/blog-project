const { errorResponse } = require("../utils/responsehandler");
const createError = require('http-errors');

// const fs = require('fs');
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // when we are throwing any error the catch will handle it
        //  and catch will call the next middleware
        if (!name || !email || !password || !phone) throw createError(404,
            'name, email, password or phone is missing');
        if (password.length < 6) throw createError(400,
            'password length should be at least 6 characters');

        const image = req.file;
        if (image && image.size > Math.pow(1024, 1))
            throw createError(400,
                'file is too large. It must be less than 1 mb in size');

        res.status(200).json({ message: 'email was sent' })
    } catch (error) {
        next(error)
    };
}

module.exports = { registerUser }

