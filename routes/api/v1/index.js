"use strict"

/// API v1
var passport = require("passport");
var mongoose = require("mongoose");
var config = require("../../../config.js");
var User = require("../../../models/user");
var Bid = require("../../../models/bid");
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
    res.status(200).json(req.user._id);
});

router.get("/bids", (req,res, next) => {
    var perPage = 10,
        page = 0;
    if (req.param('limit')){
        perPage = Number(req.param("limit"));
    }
    if (req.param('page')){
        page = Number(req.param("page"));
    }

    Bid.find({status: req.param('status')})
        .sort({created: 'desc'})
        .limit(perPage)
        .skip(perPage * page)
        .exec(function(err, bids) {
        var bidMap = [];

        bids.forEach(function(bid) {
            bidMap.push(bid)
        });

        res.status(200).json(bidMap);
    });
});

router.get("/bid/:id",(req, res) =>{
    Bid.findById(req.params.id, function (err, bid) {
        if(!bid) {
            res.statusCode = 404;
            return res.json({ error: 'Not found' });
        }
        if (!err) {
            return res.status(200).json(bid);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

router.put("/bid/:id",(req, res) =>{
    Bid.findById(req.params.id, function (err, bid) {
        if(!bid) {
            res.status(400).json({ error: 'Not found' });
        }
        if (!err) {
            bid.price = req.body.price || bid.price;
            bid.save(function (err, bid) {
                if (err) {
                    res.status(500).json(err)
                }
                res.status(200).json(bid);
            });

        } else {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

router.get("/earned",(req, res) =>{
    Bid.find({}).sort({created: 'desc'}).exec(function(err, bids) {
        var earned = 0;

        bids.forEach(function(bid) {
            earned = earned + bid.price
        });

        res.status(200).json({earned: earned});
    });
});


router.post("/bid", (req,res,next) => {
    if (!req.body.title || !req.body.phone ) {
        res.json({ success: false, message: "Please pass title and client's phone"});
    } else {
        var newBid = new Bid({
            creator: req.user._id,
            title: req.body.title,
            phone: req.body.phone,
            price: 0,
            status: "new",
            created: new Date().getTime()
        });
        newBid.save()
            .then((bid) => {
                res.json({ success: true, message: "Successful created new bid." });
            })
            .catch((err) => {
                return res.json({ success: false, message: err});
            });
    }
});

router.post("/signup", (req, res) => {
    if (!req.body.name || !req.body.password) {
        res.json({ success: false, message: "Please pass phone, name and password"});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            phone: req.body.phone,
            role: req.body.role
        });
        newUser.save()
            .then((user) => {
                res.json({ success: true, message: "Successful created new user." });
            })
            .catch((err) => {
                return res.json({ success: false, message: err});
            });
    }
});

router.post("/auth", (req, res) => {
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