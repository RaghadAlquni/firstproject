const express = require("express");
const dashboardState = express.Router();

const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");

const { getDashboard } = require("../controller/dashboardState.js");

dashboardState.get("/dashboardState", authenticate, getDashboard);

module.exports =  dashboardState;
