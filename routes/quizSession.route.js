const { requiresUser } = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/quizSession.controller')
    const questionController = require('../controller/question.controller')

    router.get('/', requiresUser, controller.getAll);

    router.post("/answer", requiresUser, controller.answerQuestion);

    router.get('/:id', requiresUser, controller.getById);
    router.post('/:category_id', requiresUser, controller.createQuizSession);
    router.put('/:id/finish', requiresUser, controller.finish);
    router.put('/:id/abandon', requiresUser, controller.abandon);

    app.use('/quiz-sessions', router);
}

