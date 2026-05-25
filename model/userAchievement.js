const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "UserAchievement",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      achievement_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      session_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      unlocked_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: "user_achievements", timestamps: false }
  );
};