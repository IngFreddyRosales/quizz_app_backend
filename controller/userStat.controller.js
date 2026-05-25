const db = require("../model");

exports.getUserStats = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const existingStats = await db.UserStat.findOne({ where: { user_id } });
        if (existingStats) {
            return res.status(200).json({ success: true, data: existingStats });
        }

        const aggregates = await db.QuizSession.findOne({
            where: { user_id, status: "finished" },
            attributes: [
                [db.sequelize.fn("COALESCE", db.sequelize.fn("SUM", db.sequelize.col("score")), 0), "total_score"],
                [db.sequelize.fn("COALESCE", db.sequelize.fn("SUM", db.sequelize.col("xp_earned")), 0), "total_xp"],
                [db.sequelize.fn("COALESCE", db.sequelize.fn("SUM", db.sequelize.col("correct_count")), 0), "total_correct"],
                [db.sequelize.fn("COALESCE", db.sequelize.fn("SUM", db.sequelize.col("wrong_count")), 0), "total_wrong"],
                [db.sequelize.fn("COUNT", db.sequelize.col("id")), "total_sessions"],
                [db.sequelize.fn("COALESCE", db.sequelize.fn("MAX", db.sequelize.col("score")), 0), "best_score"],
                [db.sequelize.fn("MAX", db.sequelize.col("finished_at")), "last_played_at"],
            ],
            raw: true,
        });

        const toNumber = (value) => (value === null || value === undefined ? 0 : Number(value));
        const total_xp = toNumber(aggregates.total_xp);

        const createdStats = await db.UserStat.create({
            user_id,
            total_xp,
            level: Math.floor(total_xp / 100) + 1,
            total_score: toNumber(aggregates.total_score),
            games_played: toNumber(aggregates.total_sessions),
            correct_answers: toNumber(aggregates.total_correct),
            wrong_answers: toNumber(aggregates.total_wrong),
            best_score: toNumber(aggregates.best_score),
            current_streak: 0,
            max_streak: 0,
            last_played_at: aggregates.last_played_at || null,
        });

        res.status(200).json({ success: true, data: createdStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};