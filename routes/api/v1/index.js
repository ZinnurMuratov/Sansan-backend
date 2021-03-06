"use strict"

/// API v1
var passport = require("passport");
var mongoose = require("mongoose");
var config = require("../../../config.js");
var jwt = require('jwt-simple');
var sessionController = require("../../../middleware/session");
var bidsController = require("../../../controllers/bid");
var signUpController = require("../../../controllers/signup");
var signInController = require("../../../controllers/signin");
var userController = require("../../../controllers/user");
var pushController = require("../../../controllers/push");

// configuring passport to work with jwt
require("../../../config/passport")(passport);



mongoose.connect(config.database)
    .then(() => console.log("connected to database"))
    .catch((err) => console.log(`connection to database ${config.database} failed`));

var router = require("express").Router();

router.use((req,res,next) => sessionController.checkSession(req,res,next));

router.get('/bids', (req,res) => bidsController.getBids(req,res));
router.get('/bid/:id', (req,res) => bidsController.getBid(req,res));
router.put('/bid/:id', (req,res) => bidsController.updateBid(req,res));
router.post('/bid', (req,res) => bidsController.createBid(req,res));

router.post('/signup', (req,res) => signUpController.signUp(req,res));
router.post('/auth', (req,res) => signInController.signIn(req,res));

router.get("/users",(req,res) => userController.getUsers(req,res));
router.put("/user" ,(req,res) => userController.updateUser(req,res));
router.get("/earned", (req,res) => userController.getBalance(req,res));

router.put("/fcm",(req, res) => pushController.attachDevice(req,res));
router.get("/fcm",(req, res) => pushController.test(req,res));

module.exports = router;