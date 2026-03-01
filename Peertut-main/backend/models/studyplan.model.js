import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import { StudyPlanTask } from "./studyPlanTask.model.js";

export const StudyPlan = sequelize.define("StudyPlan", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicGoal: {
    type: DataTypes.TEXT,
  },
  subject: {
    type: DataTypes.STRING,
  },
  timeline: {
    type: DataTypes.STRING,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tasks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deadline: {
    type: DataTypes.DATEONLY,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

// Associations
StudyPlan.hasMany(StudyPlanTask, { foreignKey: "studyPlanId", as: "tasksList" });
StudyPlanTask.belongsTo(StudyPlan, { foreignKey: "studyPlanId" });
