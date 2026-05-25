const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "QuizSession",
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
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "started",
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      xp_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      correct_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wrong_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_questions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      avg_response_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      finished_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    { tableName: "quiz_sessions", timestamps: false }
  );
};