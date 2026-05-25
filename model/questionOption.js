const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "QuestionOption",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      question_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      option_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    { tableName: "question_options", timestamps: false, createdAt: "created_at" }
  );
};