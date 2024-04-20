const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require('dotenv');

dotenv.config({path: "./config.env" })

// Import route modules
const diseaseRouter = require('./routes/diseaseRoute');
const userRouter = require('./routes/userRoute');

// error handling
const ErrorHandler = require("./controllers/errorController");
const AppError = require('./utils/AppError');

// Use Morgan middleware
if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(express.json());

// Disease and user endpoints
app.use('/api/v1/disease', diseaseRouter);
app.use('/api/v1/user', userRouter);

// Error handling for undefined routes
app.use('*', (req, res, next) => {
    return next(new AppError(`This ${req.originalUrl}  route is not defined`, 500));
});

// global error handling
app.use(ErrorHandler)

module.exports = app;