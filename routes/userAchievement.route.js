const { requiresUser } = require('../middleware/requiresUser');


module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/userAchievement.controller')

    router.get('/user/:user_id', requiresUser, controller.getUserAchievements);


    app.use('/user-achievements', router);
}