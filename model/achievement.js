const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Achievement",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      xp_reward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      condition_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      condition_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    { tableName: "achievements", timestamps: false, createdAt: "created_at" }
  );
};