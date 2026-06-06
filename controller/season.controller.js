const db = require('../model');
const { getActiveSeason } = require('../utils/season.helper');

exports.getAll = async (req, res) => {
    try {
        const seasons = await db.Season.findAll({
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({ success: true, data: seasons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const season = await db.Season.findByPk(id);

        if (!season) {
            return res.status(404).json({ success: false, message: 'Season not found' });
        }

        res.status(200).json({ success: true, data: season });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getCurrentLeaderboard = async (req, res) => {
    try {
        const activeSeason = await getActiveSeason();

        if (!activeSeason) {
            return res.status(404).json({
                success: false,
                message: 'No active season at the moment',
            });
        }

        const leaderboard = await db.SeasonUserStat.findAll({
            where: { season_id: activeSeason.id },
            include: [{
                model: db.User,
                attributes: ['id', 'username'],
            }],
            order: [
                ['total_score', 'DESC'],
                ['total_xp', 'DESC'],   
            ],
        });

        const ranked = leaderboard.map((entry, index) => ({
            rank_position:  index + 1,
            user_id:        entry.user_id,
            username:       entry.User.username,
            total_score:    entry.total_score,
            total_xp:       entry.total_xp,
            games_played:   entry.games_played,
            best_score:     entry.best_score,
            correct_answers: entry.correct_answers,
            max_streak:     entry.max_streak,
        }));

        res.status(200).json({
            success: true,
            data: {
                season: {
                    id:         activeSeason.id,
                    name:       activeSeason.name,
                    start_date: activeSeason.start_date,
                    end_date:   activeSeason.end_date,
                },
                leaderboard: ranked,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// snapshot or real-time
exports.getLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;

        const season = await db.Season.findByPk(id);

        if (!season) {
            return res.status(404).json({ success: false, message: 'Season not found' });
        }

        let ranked = [];

        if (season.status === 'finished') {
            const snapshots = await db.SeasonRankingSnapshot.findAll({ //snapshot
                where: { season_id: id },
                include: [{
                    model: db.User,
                    attributes: ['id', 'username'],
                }],
                order: [['rank_position', 'ASC']],
            });

            ranked = snapshots.map((snap) => ({
                rank_position: snap.rank_position,
                user_id:       snap.user_id,
                username:      snap.User.username,
                total_score:   snap.total_score,
                total_xp:      snap.total_xp,
                snapshot_date: snap.snapshot_date,
            }));

        } else {
            const leaderboard = await db.SeasonUserStat.findAll({ // real-time
                where: { season_id: id },
                include: [{
                    model: db.User,
                    attributes: ['id', 'username'],
                }],
                order: [
                    ['total_score', 'DESC'],
                    ['total_xp', 'DESC'],
                ],
            });

            ranked = leaderboard.map((entry, index) => ({
                rank_position:   index + 1,
                user_id:         entry.user_id,
                username:        entry.User.username,
                total_score:     entry.total_score,
                total_xp:        entry.total_xp,
                games_played:    entry.games_played,
                best_score:      entry.best_score,
                correct_answers: entry.correct_answers,
                max_streak:      entry.max_streak,
            }));
        }

        res.status(200).json({
            success: true,
            data: {
                season: {
                    id:         season.id,
                    name:       season.name,
                    status:     season.status,
                    start_date: season.start_date,
                    end_date:   season.end_date,
                },
                leaderboard: ranked,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, start_date, end_date } = req.body;

        if (!name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'name, start_date and end_date son required',
            });
        }

        if (new Date(end_date) <= new Date(start_date)) {
            return res.status(400).json({
                success: false,
                message: 'end_date va despues de start_date',
            });
        }

        // Solo puede haber una temporada activa a la vez
        const alreadyActive = await getActiveSeason();
        if (alreadyActive) {
            return res.status(400).json({
                success: false,
                message: `Ya existe una temporada activa: "${alreadyActive.name}"`,
            });
        }

        const season = await db.Season.create({
            name,
            start_date: new Date(start_date),
            end_date:   new Date(end_date),
            status:     'active',   // se crea directamente activa
        });

        res.status(201).json({ success: true, data: season });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.finish = async (req, res) => {
    try {
        const { id } = req.params;

        const season = await db.Season.findByPk(id);

        if (!season) {
            return res.status(404).json({ success: false, message: 'Season not found' });
        }

        if (season.status === 'finished') {
            return res.status(400).json({
                success: false,
                message: 'Season is already finished',
            });
        }

        // rankeo de season 
        const leaderboard = await db.SeasonUserStat.findAll({
            where: { season_id: id },
            order: [
                ['total_score', 'DESC'],
                ['total_xp', 'DESC'],
            ],
        });

        const snapshotDate = new Date();
        const snapshots = leaderboard.map((entry, index) => ({
            season_id:     id,
            user_id:       entry.user_id,
            rank_position: index + 1,
            total_score:   entry.total_score,
            total_xp:      entry.total_xp,
            snapshot_date: snapshotDate,
        }));

        await db.SeasonRankingSnapshot.bulkCreate(snapshots);

        await season.update({ status: 'finished' });

        res.status(200).json({
            success: true,
            message: `Season "${season.name}" finished successfully`,
            data: {
                season_id:      season.id,
                season_name:    season.name,
                total_players:  snapshots.length,
                snapshot_date:  snapshotDate,
                top_3: snapshots.slice(0, 3),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};