const dbconfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    dbconfig.DB, dbconfig.USER, dbconfig.PASSWORD,
    { host: dbconfig.HOST, port: dbconfig.PORT, dialect: 'postgres' }
);

sequelize.authenticate()
    .then(() => console.log('Connection established successfully.'))
    .catch(err => console.error('Unable to connect:', err));

const User            = require('./user.js')(sequelize, Sequelize.DataTypes);
const UserStat        = require('./userStat.js')(sequelize, Sequelize.DataTypes);
const Category        = require('./category.js')(sequelize, Sequelize.DataTypes);
const Question        = require('./question.js')(sequelize, Sequelize.DataTypes);
const QuestionOption  = require('./questionOption.js')(sequelize, Sequelize.DataTypes);
const QuizSession     = require('./quizSession.js')(sequelize, Sequelize.DataTypes);
const QuizAnswer      = require('./quizAnswer.js')(sequelize, Sequelize.DataTypes);
const Achievement     = require('./achievement.js')(sequelize, Sequelize.DataTypes);
const UserAchievement = require('./userAchievement.js')(sequelize, Sequelize.DataTypes);

/** User ↔ UserStat (1:1) **/
User.hasOne(UserStat, { foreignKey: 'user_id' });
UserStat.belongsTo(User, { foreignKey: 'user_id' });

/** User ↔ QuizSession **/
User.hasMany(QuizSession, { foreignKey: 'user_id' });
QuizSession.belongsTo(User, { foreignKey: 'user_id' });

/** Category ↔ Question **/
Category.hasMany(Question, { foreignKey: 'category_id' });
Question.belongsTo(Category, { foreignKey: 'category_id' });

/** Category ↔ QuizSession **/
Category.hasMany(QuizSession, { foreignKey: 'category_id' });
QuizSession.belongsTo(Category, { foreignKey: 'category_id' });

/** Question ↔ QuestionOption **/
Question.hasMany(QuestionOption, { foreignKey: 'question_id' });
QuestionOption.belongsTo(Question, { foreignKey: 'question_id' });

/** QuizSession ↔ QuizAnswer **/
QuizSession.hasMany(QuizAnswer, { foreignKey: 'session_id' });
QuizAnswer.belongsTo(QuizSession, { foreignKey: 'session_id' });

/** Question ↔ QuizAnswer **/
Question.hasMany(QuizAnswer, { foreignKey: 'question_id' });
QuizAnswer.belongsTo(Question, { foreignKey: 'question_id' });

/** QuestionOption ↔ QuizAnswer **/
QuestionOption.hasMany(QuizAnswer, { foreignKey: 'selected_option_id' });
QuizAnswer.belongsTo(QuestionOption, { foreignKey: 'selected_option_id' });

/** User ↔ Achievement (N:M via UserAchievement) **/
User.hasMany(UserAchievement, { foreignKey: 'user_id' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id' });

Achievement.hasMany(UserAchievement, { foreignKey: 'achievement_id' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id' });

/** QuizSession ↔ UserAchievement **/
QuizSession.hasMany(UserAchievement, { foreignKey: 'session_id' });
UserAchievement.belongsTo(QuizSession, { foreignKey: 'session_id' });

module.exports = {
    sequelize,
    User, UserStat, Category,
    Question, QuestionOption,
    QuizSession, QuizAnswer,
    Achievement, UserAchievement
};