const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "SeasonRankingSnapshot",
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
            rank_position: {
                type: DataTypes.INTEGER,
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
            snapshot_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "season_ranking_snapshots",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["season_id", "user_id"],
                },
            ],
        }
    );
};