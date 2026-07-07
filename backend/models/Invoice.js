const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define("Invoice", {
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "draft",
  },
  due_date: DataTypes.DATEONLY,
  notes: DataTypes.TEXT,
});

module.exports = Invoice;