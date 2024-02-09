"use strict";
const express = require("express");
//  Middleware
// const middleware = require("../middlewares")
//CONTROLLERS
const controller = require("../controllers");
const cBook = require("../controllers/books");
const cMember = require("../controllers/members");
const cBorrow = require("../controllers/borrows");

//ROUTINGS
module.exports = (app) => {
  app.get("/", (req, res) => controller.default(req, res));

  const bookRouter = express.Router()
  app.use('/book', bookRouter)
  bookRouter.post("/", (req, res) => cBook.create(req, res));
  bookRouter.get("/", (req, res) => cBook.list(req, res));
  bookRouter.patch("/update", (req, res) => cBook.update(req, res));
  bookRouter.patch("/delete", (req, res) => cBook.delete(req, res));

  const memberRouter = express.Router()
  app.use('/member', memberRouter)
  memberRouter.post("/", (req, res) => cMember.create(req, res));
  memberRouter.get("/", (req, res) => cMember.list(req, res));
  memberRouter.patch("/update", (req, res) => cMember.update(req, res));
  memberRouter.patch("/delete", (req, res) => cMember.delete(req, res));

  const borrowRouter = express.Router()
  app.use('/', borrowRouter)
  borrowRouter.get("/borrow", (req, res) => cBorrow.list(req, res));
  borrowRouter.post("/borrow", (req, res) => cBorrow.borrow(req, res));
  borrowRouter.post("/return", (req, res) => cBorrow.return(req, res));

  // catch 404 and forward to error handler
  app.use((req, res) => controller.not_found(req, res));
};
