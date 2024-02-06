"use strict";
const CONFIG = require("./apps/config");
// EXPRESS
const methodOverride = require("method-override");
const cors = require("cors");
const express = require("express");
const app = express();

// LOGGER FOR DEV
const logger = require("morgan");
if (CONFIG.env === "development") {
  app.use(logger("dev"));
}

// CORS
app.use(cors({origin: '*'}));
app.use(methodOverride("_method"));

// I/O
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// MODELS
app.models = {};
app.models.mysql = require("./apps/models/mysql");
// app.models.buffer= require('./apps/models/redis')

// CONTROLLERS ROUTE
app.routes = require("./apps/routes")(app);

app.listen(CONFIG.port, () => {
  console.info(`======= Server is running on http://localhost:${CONFIG.port} =======`);
});

module.exports = app;
