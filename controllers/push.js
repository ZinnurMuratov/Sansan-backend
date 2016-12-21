/**
 * Created by Zinnur on 21.12.16.
 */
var Fcm = require("../models/fcm");
var firebase = require("../config/firebase");
var config = require("../config.js");
var jwt = require('jwt-simple');
module.exports = {

    test : function(req, res){
        res.json({status:"ok"})
    },

    attachDevice : function (req, res, next) {
        if (!req.body.user_id || !req.body.fcm || !req.body.device) {
            res.json({ success: false, message: "Please pass userId, fcmToken and device Id"});
        } else {
            Fcm.findOne({ device : req.body.device, user_id : req.body.user_id})
                .then((fcm) => {
                    if (fcm) {
                        updateFCM(req, res, fcm);
                    } else {
                        createFCM(req, res);
                    }
                })
                .catch((err) => {
                    res.status(500).json({ success: false, message: "failed 1 " + err });
                });
        }
    }

}


function createFCM(req,res){
    var newFcm = new Fcm({
        user_id: req.body.user_id,
        device: req.body.device,
        fcm: req.body.fcm
    });
    newFcm.save()
        .then((fcm) => {
            res.status(200).json({ success: true, message: "Successfully attached device." });
        })
        .catch((err) => {
            return res.json({ success: false, message: "failed"});
        });
}

function updateFCM(req,res,fcm) {
    fcm.fcm = req.body.fcm || fcm.fcm;
    fcm.save(function (err, fcm) {
        if (err) {
            res.status(500).json({ success: false, message: "failed"});
        }
        res.status(200).json({ success: true, message: "Successfully updated fcm token." });
    });
}



