const db = require("../model");

exports.getActiveSeason = async () => {
    return await db.Season.findOne({
        where: { status: 'active' }
    });
};