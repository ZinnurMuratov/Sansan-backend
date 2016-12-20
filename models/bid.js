/**
 * Created by Zinnur on 19.12.16.
 */
"use strict"
var config = require("../config.js");
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var Schema = mongoose.Schema;
var BidSchema = new Schema({
    creator:{
        type: String,
        require: true
    },
    worker:{
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        require: true
    },

    price: {
        type: Number,
    },

    created: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    city: {
        type: String,
        require: true
    }
});

BidSchema.pre("save", function(next) {
    var bid = this;
       return next();
});


module.exports = mongoose.model('Bid', BidSchema);