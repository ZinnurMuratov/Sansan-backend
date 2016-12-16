"use strict"

/// API v1

var router = require("express").Router(); 

var users = [
     { version: "v1"},
    { name: "alik", age: 18},
    { name: "Timur", age: 19}
];

router.get("/users", (req, res, next) => {
    res.status(200).json(users);
});

module.exports = router;