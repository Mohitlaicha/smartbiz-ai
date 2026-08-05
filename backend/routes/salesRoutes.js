const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getSales,
  createSale,
  deleteSale,
} = require("../controllers/salesController");

router.get(
  "/",
  protect,
  allowRoles("admin", "manager", "employee"),
  getSales
);

router.post(
  "/",
  protect,
  allowRoles("admin", "manager", "employee"),
  createSale
);

router.delete(
  "/:id",
  protect,
  allowRoles("admin", "manager"),
  deleteSale
);

module.exports = router;