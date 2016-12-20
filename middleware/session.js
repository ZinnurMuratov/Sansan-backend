/**
 * Created by Zinnur on 20.12.16.
 */

var config = require("../config.js");;
var User = require("../models/user");
var jwt = require('jwt-simple');

function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

function safeDecode(token) {
    return new Promise(
        function(resolve, reject) {
            try {
                var decoded = jwt.decode(token, config.secret);
                resolve(decoded);
            }
            catch(err){
                reject(Error(err));
            }
        });
}
module.exports = {

    test : function(req, res){
        res.json({status:"ok"})

    },

    checkSession : function (req,res, next) {
        if (req.url === "/signup" || req.url === "/auth") {
            return next();
        }
        var token = getToken(req.headers);
        if (!token) {
            res.json({ status: false, message: "Access denied. Token not provided." });
        } else {
            safeDecode(token)
                .then((decoded) => {
                    User.findOne({ name: decoded.name })
                        .then((user) => {
                            if (!user) {
                                return res.json({ status: false, message: "Authentication failed. User not found." });
                            } else {
                                req.user = user;
                                next();
                            }
                        })
                        .catch((err) => {
                            return res.json({ status: false, message: "Authentication failed. "});
                        });
                })
                .catch((err) => {
                    return res.json({ status: false, message: "Authentication failed. "});
                });
        }
    }

}