// sessionParticipant.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const SessionParticipant = sequelize.define("SessionParticipant", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  rating: {  // ADD THIS FIELD
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  },
  ratedAt: {  // ADD THIS FIELD (optional - to track when they rated)
    type: DataTypes.DATE,
    allowNull: true,
  },
});
