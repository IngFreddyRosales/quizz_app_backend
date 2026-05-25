const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Question",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "medium",
      },
      question_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "single_choice",
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      time_limit_seconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
      },
      points_base: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    { tableName: "questions", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
  );
};