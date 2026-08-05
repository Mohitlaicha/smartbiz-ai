const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/", getDashboard);

module.exports = router;