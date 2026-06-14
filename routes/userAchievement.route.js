const { requiresUser } = require('../middleware/requiresUser');


module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/userAchievement.controller')

    router.get('/', requiresUser, controller.getUserAchievements);


    app.use('/user_achievements', router);
}