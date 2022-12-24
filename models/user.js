//This file defines the schema of the users.
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: Number,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

//passport is used to controll the usernames and passwords.
//passwords are hashed using passport.

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);