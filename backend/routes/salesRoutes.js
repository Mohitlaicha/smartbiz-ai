const express = require("express");
const router = express.Router();

const {
  getSales,
  createSale,
  deleteSale,
} = require("../controllers/salesController");

router.get("/", getSales);
router.post("/", createSale);
router.delete("/:id", deleteSale);

module.exports = router;