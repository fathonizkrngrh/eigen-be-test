"use strict";
const express = require("express");
//  Middleware
const middleware = require("../middlewares")
//CONTROLLERS
const controller = require("../controllers");
const cAuth = require("../controllers/admins/auth");

//ROUTINGS
module.exports = (app) => {
  app.get("/", (req, res) => controller.default(req, res));

  const adminAuthRouter = express.Router()
  app.use('/admin', adminAuthRouter)
  adminAuthRouter.post("/user/signin", (req, res) => cAuth.signin(req, res));
  adminAuthRouter.post("/user/signup", (req, res) => cAuth.signup(req, res));
  adminAuthRouter.get("/user/me", middleware.authentication, (req, res) => cAuth.me(req, res));

  // catch 404 and forward to error handler
  app.use((req, res) => controller.not_found(req, res));
};
