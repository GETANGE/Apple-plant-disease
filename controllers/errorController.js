const AppError = require('../utils/AppError');

const validationErrorDB = () =>{}

const jsonwebTokenError = () =>{}

const handleTokenExpireErrorDB = () =>{}

const handleDuplicateErrorErrorDB = () =>{}

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

        let err = {...err}
    }
}

module.exports=ErrorHandler;