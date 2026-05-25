module.exports = (app) => {

    const router = require('express').Router();
    const controller = require('../controller/auth.controller')

    router.post('/register', controller.register);
    router.post('/login', controller.login);



    app.use('/auth', router);
}