// const formidable = require('express-formidable');

const { registerUser, verifyUser } = require('../controllers/users');
const upload = require('../middlewares/fileUpload');

// const dev = require('../config');
const userRouter = require('express').Router();

userRouter.post('/', upload.single('image'), registerUser);
userRouter.post('/verify-user', verifyUser);
userRouter.get('*', (req, res) => {
    res.status(404).json({
        message: '404 not found'
    });
});

module.exports = userRouter;