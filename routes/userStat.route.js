const {requiresUser} = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/userStat.controller')

    router.get('/', requiresUser, controller.getUserStats);

    app.use('/user-stats', router);
}