"use strict"
var config = require("../config.js");
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var Schema = mongoose.Schema;
// mongoose.connect(config.database);
var UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        require: true
    }
});

UserSchema.pre("save", function(next) {
    var user = this;
    if (this.isNew || this.isModified("password")) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err){
               return next(err);
            }
            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err){
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else 
    return next();
});

UserSchema.methods.comparePasswords = function(passw) {
    let user = this;
    return new Promise(
        function(resolve, reject) {
            bcrypt.compare(passw, user.password, function(err, isMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(isMatch);
                }
            });
        }
    );
};

module.exports = mongoose.model('User', UserSchema);