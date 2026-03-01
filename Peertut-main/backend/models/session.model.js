import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const Session = sequelize.define("Session", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sessionType: {
    type: DataTypes.ENUM("group", "one-on-one"),
    allowNull: false,
    defaultValue: "one-on-one",
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM("booked", "cancelled", "completed"),
    defaultValue: "booked",
  },
});
