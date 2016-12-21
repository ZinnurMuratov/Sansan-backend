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
        if (!req.body.user || !req.body.fcm || !req.body.device) {
            res.json({ success: false, message: "Please pass userId, fcmToken and device Id"});
        } else {
            Fcm.findOne({ device: req.body.device })
                .then((fcmEntity) => {
                    if (!fcmEntity) {
                        createFCM(req,res)
                    } else {
                        updateFCM(req,res,fcmEntity)
                    }
                })
                .catch((err) => {
                    createFCM(req,res)
                });
        }
    }

}


function createFCM(req,res){
    var newFcm = new Fcm({
        user: req.body.user,
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

function updateFCM(req, res, fcmEntity) {
    fcmEntity.fcm = req.body.name || user.name;
    fcmEntity.save()
        .then((fcm) => {
            res.status(200).json({ success: true, message: "Successfully updated fcm token." });
        })
        .catch((err) => {
            return res.json({ success: false, message: "failed"});
        });
}

