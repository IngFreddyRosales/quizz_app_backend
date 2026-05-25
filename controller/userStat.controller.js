const db = require("../model");

exports.getUserStats = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const stats = await db.QuizSession.findAll({
            where: { user_id },
            attributes: [
                [db.sequelize.fn("SUM", db.sequelize.col("score")), "total_score"],
                [db.sequelize.fn("SUM", db.sequelize.col("xp_earned")), "total_xp"],
                [db.sequelize.fn("SUM", db.sequelize.col("correct_count")), "total_correct"],
                [db.sequelize.fn("SUM", db.sequelize.col("wrong_count")), "total_wrong"],
                [db.sequelize.fn("COUNT", db.sequelize.col("id")), "total_sessions"],
            ],
        });

        res.status(200).json({ success: true, data: stats[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};