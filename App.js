const express = require('express');
const morgan = require('morgan');
const app = express();
const helmet = require('helmet')
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: "./config.env" });

// Import route modules
const diseaseRouter = require('./routes/diseaseRoute');
const userRouter = require('./routes/userRoute');

// Import error handling middleware
const ErrorHandler = require("./controllers/errorController");
const AppError = require('./utils/AppError');

// Use Morgan middleware
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(helmet()); // protect from web vulnerabilities

app.use(express.json());
// Enable CORS middleware
app.use(cors());

app.use(function(req, res, next) {
    console.log(req.headers);
    next();
});

// Disease and user endpoints
app.use('/api/v1/disease', diseaseRouter);
app.use('/api/v1/user', userRouter);

app.get('/',(req, res)=>{
    res.json({
        message: 'Disease'
    })
})

// Error handling for undefined routes
app.use('*', (req, res, next) => {
    next(new AppError(`This ${req.originalUrl} route is not defined`, 404)); // Use 404 status code for undefined routes
});

// Global error handling middleware
app.use(ErrorHandler);

module.exports = app;