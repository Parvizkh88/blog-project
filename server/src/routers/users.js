// const formidable = require('express-formidable');

const { registerUser, verifyUser, findUser } = require('../controllers/users');
const upload = require('../middlewares/fileUpload');

// const dev = require('../config');
const userRouter = require('express').Router();

userRouter.post('/', upload.single('image'), registerUser);
// fetch the user after it is verified and added to the database
userRouter.get('/:id', findUser);
userRouter.post('/verify-user', verifyUser);
userRouter.get('*', (req, res) => {
    res.status(404).json({
        message: '404 not found'
    });
});

module.exports = userRouter;