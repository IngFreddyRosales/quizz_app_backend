const db = require("../model");
const { getActiveSeason } = require("../utils/season.helper");

exports.getAll = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const sessions = await db.QuizSession.findAll({
      where: { user_id },
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

    if (session_id == null || question_id == null) {
      return res.status(400).json({
        success: false,
        message: "session_id and question_id are required",
      });
    }

    let normalizedOptionId = selected_option_id;

    if (
      normalizedOptionId == null ||
      normalizedOptionId === "" ||
      (typeof normalizedOptionId === "string" && normalizedOptionId.trim() === "") ||
      normalizedOptionId === "null" ||
      normalizedOptionId === "undefined"
    ) {
      normalizedOptionId = null;
    }

    const session = await db.QuizSession.findOne({
      where: { id: session_id, user_id: req.user.id, status: "started" },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found" });
    }

    const alreadyAnswered = await db.QuizAnswer.findOne({
      where: { session_id, question_id },
    });

    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        message: "Question already answered in this session",
      });
    }

    const question = await db.Question.findByPk(question_id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    let isCorrect = false;
    let earnedPoints = 0;
    let option = null;

    if (normalizedOptionId !== null) {
      option = await db.QuestionOption.findOne({
        where: { id: normalizedOptionId, question_id },
      });

      if (!option) {
        return res.status(404).json({
          success: false,
          message: "Option not found for this question",
        });
      }

      isCorrect = option.is_correct;
      earnedPoints = isCorrect ? question.points_base : 0;
    }

    await db.QuizAnswer.create({
      session_id,
      question_id,
      selected_option_id: normalizedOptionId,
      is_correct: isCorrect,
      earned_points: earnedPoints,
      response_time_ms: response_time_ms || null,
    });

    await session.increment({
      score: earnedPoints,
      xp_earned: earnedPoints,
      correct_count: isCorrect ? 1 : 0,
      wrong_count: isCorrect ? 0 : 1,
    });

    const correctOption = await db.QuestionOption.findOne({
      where: { question_id, is_correct: true },
      attributes: ["id", "option_text"],
    });

    res.status(200).json({
      success: true,
      data: {
        is_correct: isCorrect,
        earned_points: earnedPoints,
        correct_option: isCorrect ? null : correctOption,
        unanswered: normalizedOptionId === null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const evaluateAchievements = async (user_id, session, stats) => {
  const allAchievements = await db.Achievement.findAll({ where: { is_active: true } });
  const alreadyUnlocked = await db.UserAchievement.findAll({ where: { user_id } });
  const unlockedIds = alreadyUnlocked.map((ua) => ua.achievement_id);
  const newlyUnlocked = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.includes(achievement.id)) continue;

    let conditionMet = false;

    switch (achievement.condition_type) {
      case "games_played":
        conditionMet = stats.games_played >= achievement.condition_value; break;
      case "correct_answers":
        conditionMet = stats.correct_answers >= achievement.condition_value; break;
      case "streak":
        conditionMet = stats.current_streak >= achievement.condition_value; break;
      case "perfect_game":
        conditionMet = session.correct_count === session.total_questions; break;
    }

    if (conditionMet) {
      await db.UserAchievement.create({
        user_id,
        achievement_id: achievement.id,
        session_id: session.id,
      });
      newlyUnlocked.push({
        name: achievement.name,
        description: achievement.description,
        xp_reward: achievement.xp_reward,
      });
    }
  }

  return newlyUnlocked;
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
    const newLevel = Math.floor(newTotalXp / 100) + 1; // cada 100 XP = nivel
    const newStreak = session.correct_count === session.total_questions
      ? stats.current_streak + 1
      : 0;

    await stats.update({
      total_xp: newTotalXp,
      level: newLevel,
      total_score: stats.total_score + session.score,
      games_played: stats.games_played + 1,
      correct_answers: stats.correct_answers + session.correct_count,
      wrong_answers: stats.wrong_answers + session.wrong_count,
      best_score: Math.max(stats.best_score, session.score),
      current_streak: newStreak,
      max_streak: Math.max(stats.max_streak, newStreak),
      last_played_at: new Date(),
    });

    const activeSeason = await getActiveSeason();
    let seasonStats = null;

    if (activeSeason) {
      let seasonStat = await db.SeasonUserStat.findOne({
        where: { season_id: activeSeason.id, user_id: req.user.id }
      });

      // Si el usuario no tiene registro en esta temporada, lo creamos
      if (!seasonStat) {
        seasonStat = await db.SeasonUserStat.create({
          season_id: activeSeason.id,
          user_id: req.user.id,
          total_score: 0,
          total_xp: 0,
          games_played: 0,
          correct_answers: 0,
          wrong_answers: 0,
          best_score: 0,
          current_streak: 0,
          max_streak: 0,
        });
      }

      const newSeasonStreak = session.correct_count === session.total_questions
        ? seasonStat.current_streak + 1
        : 0;

      await seasonStat.update({
        total_score: seasonStat.total_score + session.score,
        total_xp: seasonStat.total_xp + session.xp_earned,
        games_played: seasonStat.games_played + 1,
        correct_answers: seasonStat.correct_answers + session.correct_count,
        wrong_answers: seasonStat.wrong_answers + session.wrong_count,
        best_score: Math.max(seasonStat.best_score, session.score),
        current_streak: newSeasonStreak,
        max_streak: Math.max(seasonStat.max_streak, newSeasonStreak),
      });

      // Preparar datos para el response
      await seasonStat.reload(); // recarga los valores actualizados
      seasonStats = {
        season_name: activeSeason.name,
        total_score: seasonStat.total_score,
        total_xp: seasonStat.total_xp,
        games_played: seasonStat.games_played,
        current_streak: newSeasonStreak,
      };
    }

    // 3. Evaluar achievements (usa tus modelos Achievement y UserAchievement)
    const unlocked = await evaluateAchievements(req.user.id, session, stats);

    res.status(200).json({
      success: true,
      data: {
        session,
        stats: { total_xp: newTotalXp, level: newLevel, current_streak: newStreak },
        season_stats: seasonStats,
        unlocked_achievements: unlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.abandon = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await db.QuizSession.findOne({
      where: { id, user_id: req.user.id, status: "started" },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found" });
    }

    await session.update({ status: "abandoned", finished_at: new Date() });

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};








