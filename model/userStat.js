const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "UserStat",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      total_xp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      total_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      games_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      correct_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wrong_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      best_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      current_streak: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_streak: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_played_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    { tableName: "user_stats", timestamps: false, updatedAt: "updated_at" }
  );
};