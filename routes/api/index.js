"use strict"
const apiV1 = require("./v1");
const apiV2 = require("./v2");

module.exports.register = (app) => {
    app.use("/api/v1", apiV1);
    app.use("/api/v2", apiV2);
}