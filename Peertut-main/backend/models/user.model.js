import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const User = sequelize.define("User", {
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
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
  },
  imageUrl:{
    type: DataTypes.STRING,
  },
  qualification:{
    type: DataTypes.STRING,
    defaultValue: "",
  },
  role: {
    type: DataTypes.ENUM("student", "tutor"),
    defaultValue: "student",
  },
});
