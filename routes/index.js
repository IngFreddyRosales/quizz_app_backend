module.exports = (app) => {
    // app.use('/api/auth',                require('./auth.route'));
    require("./user.route")(app);
    // app.use('/api/user-stats',          require('./userStat.route'));
    require("./category.route")(app);
    // app.use('/api/questions',           require('./question.route'));
    // app.use('/api/question-options',    require('./questionOption.route'));
    require("./quizSession.route")(app);
    // app.use('/api/achievements',        require('./achievement.route'));
    // app.use('/api/user-achievements',   require('./userAchievement.route'));
};