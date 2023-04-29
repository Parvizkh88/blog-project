// const formidable = require('express-formidable');

const { registerUser, verifyUser, findUser, loginUser } = require('../controllers/users');
const { isLoggedIn } = require('../middlewares/auth');
const upload = require('../middlewares/fileUpload');

// const dev = require('../config');
const userRouter = require('express').Router();

userRouter.post('/', upload.single('image'), registerUser);
userRouter.post('/login', loginUser);
// fetch the user after it is verified and added to the database
userRouter.get('/:id', isLoggedIn, findUser);
userRouter.post('/verify-user', verifyUser);
userRouter.get('*', (req, res) => {
    res.status(404).json({
        message: '404 not found'
    });
});

module.exports = userRouter;