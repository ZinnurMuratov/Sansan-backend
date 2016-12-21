/**
 * Created by Zinnur on 21.12.16.
 */
var config = require("../config.js");
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var FcmSchema = new Schema({
    user_id:{
        type: String,
        require: true
    },
    device:{
        type: String,
        required: true,
        unique: true
    },
    fcm: {
        type: String,
        required: true
    }
});

FcmSchema.pre("save", function(next) {
    var fcm = this;
    return next();
});


module.exports = mongoose.model('Fcm', FcmSchema);