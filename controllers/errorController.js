const AppError = require('../utils/AppError');

const validationErrorDB = (err) =>{
    const errors =Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join(', ')}`;

    return new AppError(message, 400);
}

const jsonwebTokenError = () =>{
    message = 'Invalid token. Please login again'

    return new AppError(message, 401);
}

const handleTokenExpireErrorDB = () =>{
    message = 'Your token has expired. Please login again'

    return new AppError(message, 401);
}

const handleDuplicateErrorDB = (err) =>{
    if(err.code === 11000 && err.keyValue){
        const duplicate = Object.keys(err.keyValue)[0];

        const message = `${duplicate} already exists. Please use another ${duplicate} 😊`;

        return new AppError(message, 400);
    }
}

const handleCastErrorDB = (err) =>{
    const message = `Invalid ${err.path}: ${err.path}`;

    return new AppError(message, 400);
}

const prodError = (err, res) =>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }else{
        console.log("Error: " + err)

        res.status(500).json({
            status: 'error',
            message: 'something went wrong'
        })
    }
}

const devError = (err, res) =>{

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const ErrorHandler = (err, req, res, next) => {
    console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'production'){
        prodError(err, res);
    }else if(process.env.NODE_ENV === 'development'){
        devError(err, res);

        let error = {...err} // used to copy all the properties of the existing error
        
        if(error.name === 'CastError'){
            error = handleCastErrorDB(error)
        }

        if(error.name ===  'ValidationError'){
            error = validationErrorDB(error)
        }

        if(error.name === 'JsonwebTokenError'){
            error = jsonwebTokenError(error)
        }

        if(error.name === 'TokenExpiredError'){
            error = handleTokenExpireErrorDB(error)
        }

        if(error.code === 11000){
            error = handleDuplicateErrorDB(error)
        }
        prodError(error, res)
    }
}

module.exports=ErrorHandler;