const db = require("../model");
const { Op } = require("sequelize");

exports.getActiveSeason = async () => {
    const now = new Date();
    return await db.Season.findOne({
        where: {
            status: 'active',
            start_date: { [Op.lte]: now },
            end_date: { [Op.gte]: now },
        }
    });
};