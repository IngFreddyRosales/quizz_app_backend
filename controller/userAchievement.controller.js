const db = require("../model");

exports.getUserAchievements = async (req, res) => {
    try{
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const achievements = await db.UserAchievement.findAll({
            where: { user_id },
            include: [
                {
                    model: db.Achievement,
                    attributes: ["id", "name", "description", "icon"],
                },
            ],
        });
        res.status(200).json({ success: true, data: achievements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}