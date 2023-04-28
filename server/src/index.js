const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const morgan = require('morgan');
const createError = require('http-errors')


// const usersRouter = require('./routes/users');
const { dev } = require('./config');
const connectDatabase = require('./config/db');
const userRouter = require('./routers/users');
// const connectDB = require('./config/db');

const app = express();

// app.use(cors());

// app.use('/api/users', usersRouter)

const port = dev.app.port || 3002;

app.listen(port, async () => {
    console.log(`server is running at http://localhost:${port}`);
    // we use await since it returns a promise
    await connectDatabase();
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount userRouter at /api/users
app.use('/api/users', userRouter);

// health checkup
app.get('/test', (req, res) => {
    res.status(200).json({ message: 'testing is successful' });
});

// error middleware from express
app.use((req, res, next) => {
    // calling the http-error (the final error) from here
    // it basically means that we want to fo to the next
    // middleware but this one has the error with status code of 404 and so on
    next(createError(404, 'Not found'))
});
// next() - we can call this function from everywhere by the http-error package
app.use((err, req, res, next) => {
    // the line below says if there is an error which is created by createError
    // the res.status will be err.status, otherwise it is a server error (500)
    ; res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});