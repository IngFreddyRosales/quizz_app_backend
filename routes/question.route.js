const requiresUser = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/question.controller')

    router.get('/:categoryId', requiresUser, controller.getQuestionsByCategory);

    app.use('/questions', router);
}