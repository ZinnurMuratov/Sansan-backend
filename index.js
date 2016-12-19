"use strict"

const app = require("./app.js");
const config = require("./config");
var port = process.env.PORT || 8000
const server = app.listen(port);

server.on("listening", () => {
    app.logger.info(`Application running on ${config.host}:${port}`);
});
