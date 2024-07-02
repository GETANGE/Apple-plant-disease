const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const dotenv = require('dotenv');
const AppError = require('../utils/AppError');
const sendMail = require('../utils/email');
const crypto = require('crypto');
const sendSMS = require('../utils/sms');

dotenv.config({ path: "./config.env"})

// creating new user
exports.signup = async function (req, res, next){
    try{
        const newUser = await User.create(req.body)

        const token = jwt.sign({_id: newUser._id}, process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            })

            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
                ),
                httpOnly: true, // cookie can not be altered by the browser
            }

            if(process.env.NODE_ENV === 'production') {
                cookieOptions.secure = true
            }

            res.cookie('jwt', token, cookieOptions)

            // remove passwords from the output.
            newUser.password = undefined;

            const message = `Hello ${newUser.name}, Welcome to the Apple-Scab classiffier App`

            const company = process.env.COMPANY_NAME


                    res.status(201).json({
                    status:'success',
                    token,
                    data: {
                        token,
                        user: newUser,
                    }
                })
    
            // try{
            //     //await sendSMS(newUser.phoneNumber, message);
            //     //console.log(newUser.phoneNumber,company,message)

            //     res.status(201).json({
            //         status:'success',
            //         token,
            //         data: {
            //             token,
            //             user: newUser,
            //         }
            //     })
            // }catch(e){
            //     console.log(e);
            // }
    }catch(err){
        console.log(err);
        return next(new AppError('This user already exists', 500))
    }
}

//logging in a user
exports.loginUsers = async function (req, res, next) {
    try {
        const { email, password } = req.body;

        // check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please enter a valid email and password', 400));
        }

        // check if user exists
        const user = await User.findOne({ email: email }).select('+password');
        
        // check if user exists
        if (!user) {
            return next(new AppError('Incorrect Email or Password', 401));
        }

        // check if the email and password are correct
        const correct = await user.correctPassword(password, user.password);
        if (!correct) {
            return next(new AppError('Incorrect Email or Password', 401));
        }

        // generate token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
            ),
            httpOnly: true, // cookie can not be altered by the browser
        }

        if(process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true
        }

        res.cookie('jwt', token, cookieOptions)

        res.status(200).json({
            status: 'success',
            token,
            data: {
                token,
                user
            }
        });
    } catch (err) {
        console.log('Error' + err);
        next(err); // Pass the error to the error handling middleware
    }
};

// protecting routes
exports.protect = async function(req, res, next) {
    try {
        // Get token from headers
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to access services', 401));
        }

        // Verify the token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // Check if the user exists
        const currentUser = await User.findById(decoded._id); // Use _id from decoded token

        if (!currentUser) {
            return next(new AppError('The user belonging to this token does not exist', 401));
        }

        // Check if the user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('The user recently changed the password! Please log in again', 401));
        }

        // Attach the user object to the request for further use
        req.currentUser = currentUser;
        next();
    } catch (err) {
        console.log("The error is: " + err);
        next(err); // Pass the error to the error handling middleware
    }
};


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
    const email = req.body.email;

    const user = await User.findOne({ email: email });

    if(!user) {
        return next(new AppError('No user found with that email', 404));
    }

    // generate a reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    })

    const message = `Your password reset token is:\n\n<b>${resetToken}</b>.\n\nIf you did not make this request, please ignore this email and your password will remain unchanged.`;

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
    try {
        // Get user based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        // Check if the user exists and token is valid
        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        // Check if password and passwordConfirm match
        if (req.body.password !== req.body.passwordConfirm) {
            return next(new AppError('Password and password confirmation do not match', 400));
        }

        // Update user's password and clear reset token and expiry
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        await user.save();

        // Generate JWT token for the user
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
            ),
            httpOnly: true, // cookie can not be altered by the browser
        }

        if(process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true
        }

        res.cookie('jwt', token, cookieOptions)

        // Send success response with the new token and user data
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (err) {
        // Handle any errors during the password reset process
        console.error(err);
        next(new AppError('Error resetting password. Please try again later.', 500)); // Don't return here
    }
};

// updating password
exports.updatePassword = async function(req, res, next) {
    try {
        // 1) Get user from collection
        const user = await User.findOne({ id: req.body.id }).select('+password');

        // 2) Check if the user exists and the password is correct
        if (!user || !(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is wrong', 401));
        }

        // 3) Update the password and passwordConfirm fields
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // 4) Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
            ),
            httpOnly: true, // cookie can not be altered by the browser
        }

        if(process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true
        }

        res.cookie('jwt', token, cookieOptions)

        // 5) Send success response with token and user data
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch(err) {
        console.error(err);
        // 6) Handle any errors during password update
        next(new AppError('Error updating password. Please try again later.', 500));
    }
}