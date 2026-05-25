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

exports.getById = async (req, res) => {
	try {
		const { id } = req.params;

		const session = await db.QuizSession.findOne({
			where: { id, user_id: req.user.id },
			include: [
				{ model: db.Category, attributes: ["id", "name"] },
				{
					model: db.QuizAnswer,
					include: [
						{ model: db.Question, attributes: ["id", "question_text"] },
						{ model: db.QuestionOption, attributes: ["id", "option_text", "is_correct"] },
					],
				},
			],
		});

		if (!session) {
			return res.status(404).json({ success: false, message: "Session not found" });
		}

		res.status(200).json({ success: true, data: session });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.answerQuestion = async (req, res) => {
  try {
    const { session_id, question_id, selected_option_id, response_time_ms } = req.body;

    if (!session_id || !question_id || !selected_option_id) {
      return res.status(400).json({ success: false, message: "session_id, question_id and selected_option_id are required" });
    }

    // Verificar sesión activa del usuario autenticado
    const session = await db.QuizSession.findOne({
      where: { id: session_id, user_id: req.user.id, status: "started" },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found" });
    }

    // Evitar responder la misma pregunta dos veces
    const alreadyAnswered = await db.QuizAnswer.findOne({
      where: { session_id, question_id },
    });

    if (alreadyAnswered) {
      return res.status(400).json({ success: false, message: "Question already answered in this session" });
    }

    // Verificar que la opción pertenece a la pregunta
    const option = await db.QuestionOption.findOne({
      where: { id: selected_option_id, question_id },
    });

    if (!option) {
      return res.status(404).json({ success: false, message: "Option not found for this question" });
    }

    const question    = await db.Question.findByPk(question_id);
    const earned_points = option.is_correct ? question.points_base : 0;

    // Guardar en QuizAnswer
    await db.QuizAnswer.create({
      session_id,
      question_id,
      selected_option_id,
      is_correct:       option.is_correct,
      earned_points,
      response_time_ms: response_time_ms || null,
    });

    // Actualizar acumulados en la sesión
    await session.increment({
      score:         earned_points,
      xp_earned:     earned_points,
      correct_count: option.is_correct ? 1 : 0,
      wrong_count:   option.is_correct ? 0 : 1,
    });

    res.status(200).json({
      success: true,
      data: {
        is_correct:    option.is_correct,
        earned_points,
        // Si falló, revela cuál era la correcta
        correct_option: !option.is_correct
          ? await db.QuestionOption.findOne({
              where: { question_id, is_correct: true },
              attributes: ["id", "option_text"],
            })
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.finish = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await db.QuizSession.findOne({
      where: { id, user_id: req.user.id, status: "started" },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found" });
    }

    // 1. Cerrar la sesión
    await session.update({ status: "finished", finished_at: new Date() });

    // 2. Actualizar UserStat (ya tienes el modelo userStat.js)
    const stats = await db.UserStat.findOne({ where: { user_id: req.user.id } });

    const newTotalXp = stats.total_xp + session.xp_earned;
    const newLevel   = Math.floor(newTotalXp / 100) + 1; // cada 100 XP = nivel
    const newStreak  = session.correct_count === session.total_questions
      ? stats.current_streak + 1
      : 0;

    await stats.update({
      total_xp:        newTotalXp,
      level:           newLevel,
      total_score:     stats.total_score + session.score,
      games_played:    stats.games_played + 1,
      correct_answers: stats.correct_answers + session.correct_count,
      wrong_answers:   stats.wrong_answers + session.wrong_count,
      best_score:      Math.max(stats.best_score, session.score),
      current_streak:  newStreak,
      max_streak:      Math.max(stats.max_streak, newStreak),
      last_played_at:  new Date(),
    });

    // 3. Evaluar achievements (usa tus modelos Achievement y UserAchievement)
    const unlocked = await evaluateAchievements(req.user.id, session, stats);

    res.status(200).json({
      success: true,
      data: {
        session,
        stats: { total_xp: newTotalXp, level: newLevel, current_streak: newStreak },
        unlocked_achievements: unlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





