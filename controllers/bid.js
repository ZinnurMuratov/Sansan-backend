/**
 * Created by Zinnur on 20.12.16.
 */

var Bid = require("../models/bid");
var User = require("../models/user");
var Fcm = require("../models/fcm");
var firebase = require("../config/firebase");
var dateUtil = require("../utils/date");

module.exports = {

    test : function(req, res){
       res.json({status:"ok"})
    },

    getBids : function (req, res, next) {
        var perPage = 10,
            page = 0,
            city = "kazan";
        var query;
        if (req.param('limit')){
            perPage = Number(req.param("limit"));
        }
        if (req.param('page')){
            page = Number(req.param("page"));
        }

        if (req.param('city')){
            city = req.param("city");
        }

        if (req.param('status') == "архив"){
             query = {
                 worker : req.user._id,
                 archive: req.param('status'),
                 city: city };
        } else if (req.param('status') == "активный") {
            query = {
                worker: req.user._id,
                status: req.param('status'),
                city: city
            };
        }
         else {
            query = {
                status: req.param('status'),
                city: city
            };
        }

        if (req.user.role == "admin"){
            Bid.find({status: req.param('status'), city: city})
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
        } else {
            Bid.find(query)
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
        }


    },

    getBid : function (req, res, next) {
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
    },

    updateBid : function (req, res, next) {

        Bid.findById(req.params.id, function (err, bid) {
            if(!bid) {
                res.status(404).json({ success : false, message: 'Not found' });
            }
            if (!err) {
                if (bid.worker && bid.worker == req.user._id){
                    if (req.body.status == "отказ"){
                        bid.closed = req.body.date || bid.closed;
                        bid.status = req.body.status || bid.status;
                        bid.archive = "архив";
                    } else if (req.body.status == "выполнено"){
                        bid.closed = req.body.date || bid.closed;
                        bid.status = req.body.status || bid.status;
                        bid.price = req.body.price || bid.price;
                        bid.archive = "архив";
                    }
                    bid.save(function (err, bid) {
                        if (err) {
                            res.status(500).json(({ success: false, message : "failed"}))
                        } else {
                            getAdminsFromCity(bid.city, bid.title);
                            res.status(200).json(({ success: true, message : "updated", bid: bid}));
                        }

                    });
                } else if (bid.worker && bid.worker != req.user._id) {
                    res.status(200).json({ success: false, message : "busy"})
                } else {
                    if (bid.status === "новый") {
                        bid.worker = req.user._id || bid.worker;
                        bid.worker_name = req.user.name || bid.worker_name;
                        bid.subscribed = req.body.date || bid.subscribed;
                        bid.status = "активный" || bid.status;
                    }
                    bid.save(function (err, bid) {
                        if (err) {
                            res.status(500).json({success: false, message : "db error"});
                        } else{
                            getAdminsFromCity(bid.city, bid.title);
                            res.status(200).json({ success: true, message : "subscribed", bid : bid});
                        }

                    });
                };


            } else {
                res.status(500).json({ success: false, message : "server error"});
            }
        });
    },

    createBid : function (req, res, next) {
        if (!req.body.title || !req.body.phone || !req.body.city  || !req.body.date) {
            res.status(403).json({ success: false, message: "Please pass title, city, date and client's phone"});
        } else {
            var newBid = new Bid({
                creator: req.user._id,
                title: req.body.title,
                phone: req.body.phone,
                city: req.body.city,
                price: 0,
                status: "новый",
                created: req.body.date,
                archive: null,
                worker: null,
                worker_name: null,
                closed: null,
                subscribed: null
            });
            newBid.save()
                .then((bid) => {
                    getAllUsersFromCity(req.user.city, bid.title);
                    res.status(200).json({ success: true, message: "Successful created new bid." });
                })
                .catch((err) => {
                    return res.json({ success: false, message: "failed" + err});
                });
        }
    }
};

function getAllUsersFromCity(city, title) {
    User.find({ city : city}, function(err, users) {
        users.forEach(function(user) {
            getFCMs(user, 'Новая заявка: ' + title)
        });
    });
}

function getAdminsFromCity(city, title) {
    User.find({ city : city, role : "admin"}, function(err, users) {
        users.forEach(function(user) {
            getFCMs(user, 'Заявка обновилась: ' + title)
        });
    });
}

function getFCMs(user, title) {
    Fcm.find({ user_id : user._id}, function(err, fcms) {
        fcms.forEach(function(fcm) {
            sendPush(fcm, title)
        });

    });
}

function sendPush(fcm, title) {
    var message = {
        to: fcm.fcm,
        data: {
            title: 'СанСаныч',
            body: title
        }
    };
    firebase.send(message)
        .then(function(response){
            console.log("Successfully sent with response: ", response);
        })
        .catch(function(err){
            console.log("Something has gone wrong!");
        })
}

function validateStatus(status) {
    return !status && (status == "новый" || status == "активный" || status == "выполнено" || status == "отказ")
}

