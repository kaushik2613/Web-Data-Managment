import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const Progress = sequelize.define("Progress", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.INTEGER,
  },
  progressDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("in-progress", "completed"),
  },
});
