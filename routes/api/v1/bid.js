/**
 * Created by Zinnur on 20.12.16.
 */

var Bid = require("../../../models/bid");
var User = require("../../../models/user");

module.exports = {

    test : function(req, res){
       res.json({status:"ok"})
    },

    getBids : function (req, res, next) {
        var perPage = 10,
            page = 0,
            city = "kazan";
        if (req.param('limit')){
            perPage = Number(req.param("limit"));
        }
        if (req.param('page')){
            page = Number(req.param("page"));
        }

        if (req.param('city')){
            city = Number(req.param("city"));
        }

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
                res.status(400).json({ error: 'Not found' });
            }
            if (!err) {
                bid.price = req.body.price || bid.price;
                bid.worker = req.body.worker || bid.worker;
                bid.status = req.body.status || bid.status;
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
    },

    createBid : function (req, res, next) {
        if (!req.body.title || !req.body.phone || !req.body.city ) {
            res.json({ success: false, message: "Please pass title, city and client's phone"});
        } else {
            var newBid = new Bid({
                creator: req.user._id,
                title: req.body.title,
                phone: req.body.phone,
                city: req.body.city,
                price: 0,
                status: "new",
                created: new Date().getTime()
            });
            newBid.save()
                .then((bid) => {
                    res.json({ success: true, message: "Successful created new bid." });
                })
                .catch((err) => {
                    return res.json({ success: false, message: "failed"});
                });
        }
    }


}