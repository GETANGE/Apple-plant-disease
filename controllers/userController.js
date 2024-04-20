const AppError = require('../utils/AppError');
const User = require('../models/userModel');

// getting all the users
exports.getAllUsers= async function(req, res, next) {
    const users =await User.find();
    res.status(200).json({
        status: 'Success',
        data:{
            users
        }
    });

    next();
}

exports.createUser=function(req, res) {
    res.status(500).json({
        status: 'Error',
        message: 'This route is not yet defined'
    });
}

exports.getUser=function(req, res) {
    res.status(500).json({
        status: 'Error',
        message: 'This route is not yet defined'
    });
}

exports.updateUser=function(req, res) {
    res.status(500).json({
        status: 'Error',
        message: 'This route is not yet defined'
    });
}

exports.deleteUser=function(req, res) {
    res.status(500).json({
        status: 'Error',
        message: 'This route is not yet defined'
    });
}