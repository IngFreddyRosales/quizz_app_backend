const db = require("../model");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await db.Category.findAll();
        res.status(200).json({ success: true, data: categories });
    }catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}