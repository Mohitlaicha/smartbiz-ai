const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Sales = sequelize.define("Sales", {
  invoice_number: {
    type: DataTypes.STRING,
  },
  customer_id: {
    type: DataTypes.INTEGER,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: "cash",
  },
  total_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "completed",
  },
  notes: {
    type: DataTypes.TEXT,
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Sales;