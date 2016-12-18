"use strict"

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require("../models/user");
var config = require("../config.js");

module.exports = (passport) => {
    var options = { secretOrKey : config.secret };
    options.jwtFromRequest = ExtractJwt.fromBodyField("session");
    passport.use(new JwtStrategy(options, function(jwt_payload, done) {
            let query = User.findOne({ id: jwt_payload.id });
            query.exec()
                .then((user) => {
                    if (user) {
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                })
                .then((err) => {
                    done(err, false)
                });
        }
    ));
};