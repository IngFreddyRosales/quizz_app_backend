const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "QuizAnswer",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      session_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      selected_option_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      earned_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      response_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      answered_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: "quiz_answers", timestamps: false }
  );
};