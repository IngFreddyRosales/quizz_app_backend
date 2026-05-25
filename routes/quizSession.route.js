const requiresUser = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/quizSession.controller')

    router.get('/', requiresUser, controller.getAll);
    router.post('/:category_id', requiresUser, controller.createQuizSession);

    app.use('/quiz-sessions', router);
}