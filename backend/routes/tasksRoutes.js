const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getTasks,
  getMyTasks,
  createTask,
  updateMyTaskStatus,
} = require("../controllers/taskController");

router.get(
  "/",
  protect,
  allowRoles("admin", "manager"),
  getTasks
);

router.post(
  "/",
  protect,
  allowRoles("admin", "manager"),
  createTask
);

router.get(
  "/my",
  protect,
  allowRoles("employee"),
  getMyTasks
);

router.put(
  "/my/:id/status",
  protect,
  allowRoles("employee"),
  updateMyTaskStatus
);

module.exports = router;