module.exports = (app) => {
    require("./auth.route")(app);
    // require("./user.route")(app);
    require("./userStat.route")(app);
    require("./category.route")(app);
    require("./question.route")(app);
    require("./quizSession.route")(app);
    require("./userAchievement.route")(app);
};