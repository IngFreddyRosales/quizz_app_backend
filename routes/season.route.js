const {requiresUser, requiresAdmin} = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/season.controller')


    router.get('/', requiresUser, controller.getAll);
    router.get('/current/leaderboard', requiresUser, controller.getCurrentLeaderboard);
    router.get('/id/:id', requiresUser, controller.getById);    
    router.get('/leaderboard/:id', requiresUser, controller.getLeaderboard);

    router.post('/', requiresUser, requiresAdmin, controller.create);
    router.put('/:id/finish', requiresUser, requiresAdmin, controller.finish);

    app.use('/seasons', router);
}