const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "Season",
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("pending", "active", "finished"),
                allowNull: false,
                defaultValue: "pending",
            },
        },
        {
            tableName: "seasons",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
};