/**
 * Created by Zinnur on 20.12.16.
 */
var User = require("../models/user");
var config = require("../config.js");
var jwt = require('jwt-simple');
module.exports = {

    test : function(req, res){
        res.json({status:"ok"})
    },

    signIn : function (req, res, next) {
        if (!req.body.phone || !req.body.password) {
            res.json({ success: false, message: "Please pass phone and password"});
        } else {
            User.findOne({ phone: req.body.phone })
                .then((user) => {
                    if (!user) {
                        res.json({ success: false, message: "Authentication failed. User not found. "});
                    } else {
                        user.comparePasswords(req.body.password)
                            .then((isMatch) => {
                                if (isMatch) {
                                    let token = jwt.encode(user, config.secret);
                                    res.json({ success: true, token: "JWT " + token, user: user });
                                } else {
                                    res.json({ success: false, message: "Authentication failed. Wrong password." });
                                }
                            })
                            .catch((err) => {
                                res.json({ success: false, message: "Authentication failed "});
                            });
                    }
                })
                .catch((err) => {
                    res.json({ success: false, message: "Authentication failed." });
                });
        }
    }


}