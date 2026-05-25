module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/userAchievement.controller')

    router.get('/user/:user_id', controller.getUserAchievements);


    app.use('/user-achievements', router);
}