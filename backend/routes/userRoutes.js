
const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id/role", updateUserRole);
router.put("/:id/status", updateUserStatus);

module.exports = router;