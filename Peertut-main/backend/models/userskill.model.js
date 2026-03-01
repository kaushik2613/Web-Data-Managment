import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const UserSkill = sequelize.define("UserSkill", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
