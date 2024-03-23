const express = require('express');
const morgan = require('morgan');
const app = express();

// Import route modules
const diseaseRoute = require('./routes/diseaseRoute');
const userRoute = require('./routes/userRoute');

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
    res.status(404).json({
        status: 'error',
        message: 'This route does not exist'
    });
    next();
});

module.exports = app;