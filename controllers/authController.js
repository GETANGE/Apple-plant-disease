const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const dotenv = require('dotenv')
const AppError = require('../utils/AppError')
const sendMail = require('../utils/email')

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
        next(new AppError('This user already exists', 500))
    }
}

//logging in a user
exports.loginUsers = async function (req, res, next) {
    try{
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
    }catch(err){
        console.log('Error'+ err)
    }
}

// protecting routes
exports.protect  = async function(req, res, next) {
    try{
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
    }catch(err){
        console.log("The error is :"+err);
        }
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
exports.forgotPassword = async function(req, res, next) {
    // get user based on the POSTed email
    const user = await User.findOne({email:req.body.email});

    if(!user) {
        return next(new AppError('No user found with that email', 404));
    }

    // generate a reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    })

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a your new password and confirm your new password to : ${resetURL}.\n 
    If you did not make this request, please ignore this email and your password will remain unchanged.`

    try{
        await sendMail({
            email: req.body.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        })

        res.status(200).json({
            status:'success',
            message: 'Token sent to email',
            id:user.id,
            name:user.name
        })

    }catch(err){
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({
            validateBeforeSave: false
        })

        return next(new AppError('There was an error sending the Email', 500))
    }
}

// resetting password
exports.resetPassword = async function(req, res, next) {
    try{
        // get user based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {$gt: Date.now()}
        })

        if(!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }else{
            user.password = req.body.password;
            user.passwordConfirm = req.body.passwordConfirm;
            user.passwordResetExpires = undefined;
            user.passwordResetToken = undefined;

            await user.save();
        }

        // log in the user
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.status(200).json({
            status:'success',
            token,
            data: {
                user
            }
        })
    }catch(err){
        console.log(err);
        return next(new AppError('Error resetting password', 500));
    }
} 