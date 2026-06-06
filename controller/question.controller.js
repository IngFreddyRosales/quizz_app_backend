const db = require("../model");

exports.getQuestionsByCategory = async (req, res) => {
	try {
		const category_id = req.params.category_id ;
		const limit =  10;

		if (!category_id) {
			return res.status(400).json({ success: false, message: "category_id is required" });
		}

		// verificar si el id de categoria existe
		const category = await db.Category.findOne({
			where: { id: category_id },
		});

		if (!category) {
			return res.status(404).json({ success: false, message: "Category not found " });
		}

		const questions = await db.Question.findAll({
			where: {
				category_id,
				is_active: true,
			},
			order: db.sequelize.random(),
			limit,
			include: [
				{
					model: db.QuestionOption,
					attributes: ["id", "option_text"],
				},
			],
		});

		res.status(200).json({ success: true, data: questions });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

