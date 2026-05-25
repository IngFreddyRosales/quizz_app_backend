const requiresUser = require('../middleware/requiresUser');

module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/category.controller')

    router.get('/', requiresUser, controller.getAllCategories);

    app.use('/categories', router);
}