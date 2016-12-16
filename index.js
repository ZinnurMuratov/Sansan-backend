"use strict"

const app = require("./app.js");
const config = require("./config");

const port = config.port;
const server = app.listen(port);

server.on("listening", () => {
    app.logger.info(`Application running on ${config.host}:${port}`);
});
