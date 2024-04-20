const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const dotenv = require('dotenv')
const AppError = require('../utils/AppError')

dotenv.config({ path: "./config.env"})

// creating new user
exports.signup = async function (req, res, next){
    try{
        const newUser = await User.create(req.body)

        const token = jwt.sign({_id: newUser._id}, process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            })
    
        res.status(201).json({
            status:'success',
            token,
            data: {
                user: newUser,
            }
        })
    }catch(err){
        next(new AppError(err, 500))
    }
}

//logging in a user
exports.loginUsers = async function (req, res, next) {
    const {email, password} = req.body;

    // check if email and password exist
    if(!email || !password) {
        return next(new AppError('Please enter a valid email and password', 400));
    }

    // check if user exists
    const user = await User.findOne({email:email}).select('+password');
    // check if the email and password exist
    const correct = await user.correctPassword(password, user.password)
    if(!user || !correct) {
        return next(new AppError('Incorrect Email or Password', 400));
    }

    // if correct send  token to client.
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        })

    res.status(200).json({
        status:'success',
        token,
        data: {
            user
        }
    })
}

// protecting routes
exports.protect  = async function(req, res, next) {
    // get token and check if it exists
    let token ;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('You are not logged in! please log in to access services', 401))
    }
    // verify the token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // check if the user exists
    const currentUser = await User.findById(decode.id);

    if(!currentUser){
        return next(new AppError('The user belonging to this token does not exist', 401))
    }

    // check if the user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decode.iat)) {
        return next(new AppError('The user recently changed the password!. Please login again', 401))
    }

    req.currentUser = currentUser;
    next();
}

// authorization of roles.
exports.restrictTo = function(...roles) {
    return (req, res, next) => {
        // role ['admin', 'user']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You are not authorized to perform  this action.', 403));
        }
    }
}

// Password reset functionality.