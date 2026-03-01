import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const Profile = sequelize.define("Profile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  bio: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5,
  },
  availability: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  reviewCount: {
    // ADD THIS FIELD
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});
