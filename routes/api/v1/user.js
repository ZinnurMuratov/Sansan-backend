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
    },

    updateUser : function (req,res) {
        User.findById(req.user._id, function (err, user) {
            if(!user) {
                res.status(400).json({ error: 'Not found' });
            }
            if (!err) {
                user.city = req.user.city || user.city;
                user.name = req.user.name || user.name;
                user.role = req.user.role || user.role;
                user.save(function (err, bid) {
                    if (err) {
                        res.status(500).json({success:false, message : "Error"})
                    }
                    res.status(200).json(user);
                });

            } else {
                res.status(500).json({ error: 'Server error' });
            }
        });
    }

}