/**
 * Created by Zinnur on 20.12.16.
 */

var passport = require("passport");
var config = require("../config.js");
var User = require("../models/user");
var Bid = require("../models/bid");

module.exports = {

    test : function(req, res){
        res.json({status:"ok"})
    },

    getUsers : function (req,res, next) {
        res.status(200).json(req.user._id);
    },

    getBalance : function (req,res) {
        if (req.user.role == "worker"){
            Bid.find({worker: req.param('worker')}).exec(function(err, bids) {
                var earned = 0;
                bids.forEach(function(bid) {
                    console.log("bid "+ bid.price );
                    earned = earned + bid.price
                });

                res.status(200).json({ success: true, earned: earned});
            });
        } else {
            Bid.find({city: req.user.city}).exec(function(err, bids) {
                var earned = 0;
                bids.forEach(function(bid) {
                    console.log("bid admin -> "+ bid.price );
                    earned = earned + bid.price
                    console.log("earned admin ->"+ bid.price );
                });

                earned = earned * 0,2;
                console.log(" admin"+ earned );

                res.status(200).json({ success: true, earned: earned});
            });
        }

    },

    updateUser : function (req,res) {
        User.findById(req.user._id, function (err, user) {
            if(!user) {
                res.status(400).json({ error: 'Not found' });
            }
            if (!err) {
                user.city = req.body.city || user.city;
                user.name = req.body.name || user.name;
                user.role = req.body.role || user.role;
                user.save(function (err, user) {
                    if (err) {
                        res.status(500).json({success:false, message : "Error"})
                    }
                    res.status(200).json(user);
                });

            } else {
                res.status(500).json({ error: 'Server error' });
            }
        });
    },


}