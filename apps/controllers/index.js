"use strict";
const RESPONSE = require("../utilities/response")

module.exports = {
  default: (req, res) => {
    res.status(200).send("HELLO, WELCOME TO LIBRARY API");
  },
  not_found: (req, res) => {
    const response = RESPONSE.error('unknown')
    response.error_message = 'Resource not found.'
    return res.status(404).json(response)
  },
};
//http://www.mysqltutorial.org/mysql-nodejs/
//https://webapplog.com/handlebars/
