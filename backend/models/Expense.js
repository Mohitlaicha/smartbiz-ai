const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Expense = sequelize.define("Expense", {
  title: DataTypes.STRING,
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "other",
  },
  date: DataTypes.DATEONLY,
  vendor: DataTypes.STRING,
  notes: DataTypes.TEXT,
});

module.exports = Expense;