const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const reportController = require("../controllers/reportController");

console.log("protect:", typeof protect);
console.log("allowRoles:", typeof allowRoles);
console.log(
  "getReports:",
  typeof reportController.getReports
);

router.get(
  "/",
  protect,
  allowRoles("admin", "manager"),
  reportController.getReports
);

module.exports = router;