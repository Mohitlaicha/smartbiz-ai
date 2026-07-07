const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "other",
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  low_stock_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  cost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  supplier: DataTypes.STRING,
  sku: DataTypes.STRING,
  description: DataTypes.TEXT,
});

module.exports = Product;