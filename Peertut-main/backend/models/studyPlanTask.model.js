import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const StudyPlanTask = sequelize.define("StudyPlanTask", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studyPlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  due: {
    type: DataTypes.DATEONLY,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
