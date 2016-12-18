"use strict"

/// API v1
var passport = require("passport");
var mongoose = require("mongoose");
var config = require("../../../config.js");
var User = require("../../../models/user");
var jwt = require('jwt-simple');

// configuring passport to work with jwt
require("../../../config/passport")(passport);

mongoose.connect(config.database)
    .then(() => console.log("connected to database"))
    .catch((err) => console.log(`connection to database ${config.database} failed`));

var router = require("express").Router(); 

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

// Authentication checker middleware for the router
router.use((req, res, next) => {
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
                        return res.json({ status: false, message: "Authentication failed. " + err});
                    });
            })
            .catch((err) => {
                return res.json({ status: false, message: "Authentication failed. " + err});
            });
    }

});

var users = [
     { version: "v1"},
    { name: "alik", age: 18},
    { name: "Timur", age: 19}
];

router.get("/users", (req, res, next) => {
    users.push(req.user);
    res.status(200).json(users);
});

router.post("/signup", (req, res) => {
    if (!req.body.name || !req.body.password) {
        res.json({ success: false, message: "Please pass name and password"});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });
        newUser.save()
            .then((user) => {
                res.json({ success: true, message: "Successful created new user." });
            })
            .catch((err) => {
                return res.json({ success: false, message: "Username already exists."});
            });
    }
});

router.post("/auth", (req, res) => {
    if (!req.body.name || !req.body.password) {
        res.json({ success: false, message: "Please pass name and password"});
    } else {
        User.findOne({ name: req.body.name })
            .then((user) => {
                if (!user) {
                    res.json({ success: false, message: "Authentication failed. User not found. "});
                } else {
                    user.comparePasswords(req.body.password)
                        .then((isMatch) => {
                            if (isMatch) {
                                let token = jwt.encode(user, config.secret);
                                res.json({ success: true, token: "JWT " + token });
                            } else {
                                res.json({ success: false, message: "Authentication failed. Wrong password." });
                            }
                        })
                        .catch((err) => {
                            res.json({ success: false, message: "Authentication failed." + err });
                        });
                }
            })
            .catch((err) => {
                res.json({ success: false, message: "Authentication failed." + err });
            });
    }
});

module.exports = router;