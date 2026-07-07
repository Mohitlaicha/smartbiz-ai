const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Employee = sequelize.define("Employee", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  role: DataTypes.STRING,
  department: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
});

module.exports = Employee;