require('dotenv').config();

exports.dev = {
    app: {
        port: process.env.SERVER_PORT || 3001,
        jwtAccountActivationKey: process.env.JWT_ACCOUNT_ACTIVATION_KEY,
        smtpPassword: process.env.SMTP_PASSWORD,
        smtpUsername: process.env.SMTP_USERNAME
    },
    db: {
        url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/blog-db',

    },
};

