"use strict"
const Op = require('sequelize').Op
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql");
const jwt = require('../utilities/token');
const tMerchant =model.merchants
const tUser =model.users
const tAccount =model.accounts

