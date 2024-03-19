const express = require('express');
const morgan = require('morgan');
const app = express();

// import route modules 
const diseaseRoute = require('./routes/diseaseRoute');
const userRoute = require('./routes/userRoute'); 

// Use Morgan middleware 
app.use(morgan('dev'));

// disease and user endpoint
app.use('api/v1/disease', diseaseRoute);
app.use('api/v1/user', userRoute);

// error handling undefined routes
app.use('*', (req, res, next) => {
    res.status(404).json({
        status: 'success',
        message: 'This route does not exist'
    });
    next();
});

module.exports = app