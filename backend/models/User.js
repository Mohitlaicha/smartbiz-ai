const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM("admin", "manager", "employee"),
    allowNull: false,
    defaultValue: "employee",
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },

resetPasswordToken: {
  type: DataTypes.STRING,
  allowNull: true,
},

resetPasswordExpires: {
  type: DataTypes.DATE,
  allowNull: true,
},

});

module.exports = User;