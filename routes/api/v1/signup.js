/**
 * Created by Zinnur on 20.12.16.
 */

var User = require("../../../models/user");
module.exports = {

    test : function(req, res){
        res.json({status:"ok"})
    },

    signUp : function (req, res, next) {
        if (!req.body.phone || !req.body.name || !req.body.password || req.body.city) {
            res.json({ success: false, message: "Please pass phone, name, city and password"});
        } else {
            var newUser = new User({
                name: req.body.name,
                password: req.body.password,
                phone: req.body.phone,
                role: req.body.role,
                city: req.body.city
            });
            newUser.save()
                .then((user) => {
                    res.json({ success: true, message: "Successful created new user." });
                })
                .catch((err) => {
                    return res.json({ success: false, message: "failed"});
                });
        }
    }


}