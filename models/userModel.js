const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const usersSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [ validator.isEmail, 'Please enter a valid email']
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        unique: true,
        minLength: 8,
        select: false
    },
    passwordChangedAt: Date,
    passwordConfirm:{
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(passwordConfirm) {
                return passwordConfirm === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date
})

usersSchema.pre('save', async function (next) {
    // only run this function if the password was modified
    if (!this.isModified('password')) {
        return next();
    } else {
        // Hash the password with cost of 12 characters
        this.password = await bcrypt.hash(this.password, 12);

        // Delete the passwordConfirmation field
        this.passwordConfirm = undefined;
    }

    next();
});

usersSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew){
        return next();
    }else{
        this.passwordChangedAt = Date.now() - 1000;
        next();
    }
})

// (correctPassword)=> instance methods
usersSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
} 

// (changedPasswordAfter)=> instance methods
usersSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        //console.log(this.passwordChangedAt, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    return false; // not changed
}

// (createPasswordResetToken)=> instance method in MongoDB
// N/B instance method in MongoDB => methods that can be called on individual document instances.
usersSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex'); // this token will be sent to the user.

    this.passwordResetToken= crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

        console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

// create a new model.
const User = mongoose.model('User', usersSchema);

module.exports = User;