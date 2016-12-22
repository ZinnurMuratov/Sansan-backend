/**
 * Created by Zinnur on 21.12.16.
 */
var Fcm = require("../models/fcm");
var firebase = require("../config/firebase");
var config = require("../config.js");
var jwt = require('jwt-simple');

module.exports = {

    test : function(req, res){
        Fcm.findOne({ user_id : req.user._id})
            .then((fcm) => {
                if (fcm) {
                    sendPush(req, res, fcm);
                } else {
                    res.status(404).json({ success: false, message: "not found fcm token"});
                }
            })
            .catch((err) => {
                res.status(500).json({ success: false, message: "failed  " + err });
            });

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
                    res.status(500).json({ success: false, message: "failed seacrh"  });
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
            return res.json({ success: false, message: "failed on save" });
        });
}

function updateFCM(req,res,fcm) {
    fcm.fcm = req.body.fcm || fcm.fcm;
    fcm.save(function (err, fcm) {
        if (err) {
            res.status(500).json({ success: false, message: "failed on update" });
        }
        res.status(200).json({ success: true, message: "Successfully updated fcm token." });
    });
}

function sendPush(req, res, fcm) {
    var message = {
        to: fcm.fcm,
        data: {
            your_custom_data_key: 'hello'
        },
        notification: {
            title: 'Hello World',
            body: 'test push notification'
        }
    };
    firebase.send(message)
        .then(function(response){
            console.log("Successfully sent with response: ", response);
            res.status(200).json({ success: true, message: response });
        })
        .catch(function(err){
            console.log("Something has gone wrong!");
            res.status(500).json({ success: false, message: err });
        })
}



