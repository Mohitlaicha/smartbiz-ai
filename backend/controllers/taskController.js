const Task = require("../models/Task");
const User = require("../models/User");
const { Op } = require("sequelize");
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      due_date,
      category,
      assignedTo,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    let employeeId = null;

    // If an individual employee was selected
    if (
      assignedTo !== null &&
      assignedTo !== undefined &&
      assignedTo !== "" &&
      assignedTo !== "all"
    ) {
      employeeId = Number(assignedTo);

      const employee = await User.findOne({
        where: {
          id: employeeId,
          role: "employee",
          status: "active",
        },
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      status: status || "todo",
      due_date: due_date || null,
      category: category || "other",

      // null means ALL employees
      assignedTo: employeeId,

      assignedBy: req.user.id,
    });

    return res.status(201).json({
      message:
        employeeId === null
          ? "Task assigned to all employees"
          : "Task assigned successfully",

      task,
    });
  } catch (error) {
    console.error(
      "Create task error:",
      error
    );

    return res.status(500).json({
      message: "Unable to create task",
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
        [Op.or]: [
          // specifically assigned to logged-in employee
          {
            assignedTo: req.user.id,
          },

          // assigned to everybody
          {
            assignedTo: null,
          },
        ],
      },

      include: [
        {
          model: User,
          as: "assigner",
          attributes: [
            "id",
            "name",
          ],
        },
        {
          model: User,
          as: "assignee",
          attributes: [
            "id",
            "name",
            "email",
          ],
          required: false,
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    });

    return res.json(tasks);
  } catch (error) {
    console.error(
      "Get my tasks error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load tasks",
    });
  }
};
exports.updateMyTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "todo",
      "in_progress",
      "review",
      "done",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

   const task = await Task.findOne({
  where: {
    id,

    [Op.or]: [
      {
        assignedTo: req.user.id,
      },
      {
        assignedTo: null,
      },
    ],
  },
});
    if (!task) {
      return res.status(404).json({
        message: "Task not found or not assigned to you",
      });
    }

    task.status = status;

    await task.save();

    return res.status(200).json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error(
      "Update task status error:",
      error
    );

    return res.status(500).json({
      message: "Unable to update task status",
    });
  }
};