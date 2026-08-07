const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");



const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },

  status: {
    type: DataTypes.ENUM(
      "pending",
      "in_progress",
      "completed"
    ),
    defaultValue: "pending",
  },

  priority: {
    type: DataTypes.ENUM(
      "low",
      "medium",
      "high"
    ),
    defaultValue: "medium",
  },

  dueDate: {
    type: DataTypes.DATE,
  },

  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Task;