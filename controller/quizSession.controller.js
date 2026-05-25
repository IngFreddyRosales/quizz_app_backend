const db = require("../model");

exports.getAll = async (req, res) => {
	try {
		const { user_id } = req.query;
		const resolvedUserId = user_id || req.user?.id;

		if (!resolvedUserId) {
			return res.status(400).json({ success: false, message: "user_id is required" });
		}

		const sessions = await db.QuizSession.findAll({
			where: { user_id: resolvedUserId },
			include: [{ model: db.Category, attributes: ["id", "name", "icon"] }],
			order: [["started_at", "DESC"]],
		});

		res.status(200).json({ success: true, data: sessions });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.createQuizSession = async (req, res) => {
	try {
		const { category_id } = req.params;
		const user_id = req.user?.id;

		if (!user_id) {
			return res.status(401).json({ success: false, message: "User not authenticated" });
		}

		if (!category_id) {
			return res.status(400).json({ success: false, message: "category_id is required" });
		}

		const category = await db.Category.findOne({
			where: { id: category_id, is_active: true },
		});

		if (!category) {
			return res.status(404).json({ success: false, message: "Category not found or inactive" });
		}

		const activeSession = await db.QuizSession.findOne({
			where: { user_id, category_id, status: "started" },
		});

		if (activeSession) {
			return res.status(400).json({
				success: false,
				message: "You already have an active session in this category",
				data: { session_id: activeSession.id },
			});
		}

		const availableQuestions = await db.Question.count({ where: { category_id } });
		const totalQuestions = availableQuestions > 10 ? 10 : availableQuestions;

		const session = await db.QuizSession.create({
			user_id,
			category_id,
			total_questions: totalQuestions,
			status: "started",
			started_at: new Date(),
		});

		res.status(201).json({ success: true, data: session });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};



