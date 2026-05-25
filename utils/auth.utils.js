const bcryp = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const generateAuthToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    return jwt.sign(payload, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const generatePassword = async (password) => {

    const salt = await bcryp.genSalt(SALT_ROUNDS);
    return bcryp.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return bcryp.compare(password, hash);
};

const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};

module.exports = {
    generateAuthToken,
    generatePassword,
    comparePassword,
    verifyToken
};