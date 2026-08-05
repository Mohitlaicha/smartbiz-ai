const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  askAdvisor,
} = require("../controllers/aiController");

router.post(
  "/advisor",
  protect,
  allowRoles("admin", "manager"),
  askAdvisor
);

allowRoles("admin", "manager")

module.exports = router;