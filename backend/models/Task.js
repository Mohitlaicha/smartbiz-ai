const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define("Task", {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: "todo",
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: "medium",
  },
  due_date: DataTypes.DATEONLY,
});

module.exports = Task;