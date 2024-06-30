const express = require('express');
const morgan = require('morgan');
const app = express();
const helmet = require('helmet')
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

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

// protecting from cross-domain requests
app.use(cookieParser());

// adding rate limit to count requests coming from one Ip address.
const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
})
app.use('/api',rateLimiter)

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