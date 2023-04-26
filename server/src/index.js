const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const morgan = require('morgan');

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
    res.status(404).send('route Not found');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('something broke');
});