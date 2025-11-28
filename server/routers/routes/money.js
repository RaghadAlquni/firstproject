const express = require("express");
const financeRouter = express.Router();
const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");

const { getFinanceStats, addExpense } = require("../controller/money.js");

financeRouter.get("/finance/status", getFinanceStats);
financeRouter.post("/expenses/add", authenticate, authorize(["admin", "director", "assistant_director"]), addExpense); 


module.exports = financeRouter;
