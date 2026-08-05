const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

router.get(
  "/",
  protect,
  allowRoles("admin", "manager"),
  getEmployees
);

router.post(
  "/",
  protect,
  allowRoles("admin"),
  createEmployee
);

module.exports = router;