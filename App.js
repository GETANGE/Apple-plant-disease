const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require('dotenv');

dotenv.config({path: "./config.env" })

// Import route modules
const diseaseRoute = require('./routes/diseaseRoute');
const userRoute = require('./routes/userRoute');

// error handling
const ErrorHandler = require("./controllers/errorController");
const AppError = require('./utils/AppError');

// Use Morgan middleware
if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(express.json());

// Disease and user endpoints
app.use('/api/v1/disease', diseaseRoute);
// app.use('/api/v1/user', userRoute);

// Error handling for undefined routes
app.use('*', (req, res, next) => {
    return next(new AppError(`This ${req.originalUrl}route is not defined`, 500));
});

// global error handling
app.use(ErrorHandler)

module.exports = app;