const Task = require("../models/Task");
const User = require("../models/User");

exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
    } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        message: "Title and employee are required",
      });
    }

    const employee = await User.findOne({
      where: {
        id: assignedTo,
        role: "employee",
        status: "active",
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      assignedBy: req.user.id,
      status: "pending",
    });

    return res.status(201).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      message: "Unable to assign task",
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "assigner",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Unable to load tasks",
    });
  }
};
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        assignedTo: req.user.id,
      },

      include: [
        {
          model: User,
          as: "assigner",
          attributes: ["id", "name"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.json(tasks);
  } catch (error) {
    console.error("My tasks error:", error);

    return res.status(500).json({
      message: "Unable to load your tasks",
    });
  }
};

exports.updateMyTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "in_progress",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const task = await Task.findOne({
      where: {
        id,
        assignedTo: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    task.status = status;

    await task.save();

    return res.json({
      message: "Task status updated",
      task,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to update task",
    });
  }
};