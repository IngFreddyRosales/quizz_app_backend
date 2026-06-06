const requiresUser = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/quizSession.controller')
    const questionController = require('../controller/question.controller')

    router.get('/', requiresUser, controller.getAll);
    router.get('/:id', requiresUser, controller.getById);
    router.get('/questions/:category_id', requiresUser, questionController.getQuestionsByCategory);
    router.post("/answer", requiresUser, controller.answerQuestion);
    router.post('/:category_id', requiresUser, controller.createQuizSession);
    router.put('/:id/finish', requiresUser, controller.finish);
    router.put('/:id/abandon', requiresUser, controller.abandon);

    app.use('/quiz-sessions', router);
}

