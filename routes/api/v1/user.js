/**
 * Created by Zinnur on 20.12.16.
 */

var passport = require("passport");
var config = require("../../../config.js");
var User = require("../../../models/user");
var Bid = require("../../../models/bid");

module.exports = {

    test : function(req, res){
        res.json({status:"ok"})
    },

    getUsers : function (req,res, next) {
        res.status(200).json(req.user._id);
    },

    getBalance : function (req,res) {
        Bid.find({worker: req.param('worker')}).exec(function(err, bids) {
            var earned = 0;

            bids.forEach(function(bid) {
                earned = earned + bid.price
            });

            res.status(200).json({ success: true, earned: earned});
        });
    }

}