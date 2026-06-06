const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "SeasonUserStat",
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            season_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            total_score: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            total_xp: {
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
        },
        {
            tableName: "season_user_stats",
            timestamps: false,
            updatedAt: "updated_at",
            indexes: [
                {
                    unique: true,
                    fields: ["season_id", "user_id"],
                },
            ],
        }
    );
};