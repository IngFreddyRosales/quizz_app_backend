const db = require("../model");
const { generateAuthToken, generatePassword, comparePassword } = require('../utils/auth.utils');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
    }

    const existingUser = await db.User.findOne({
        where: { email }
    });

    if (existingUser) {
        return res.status(400).json({ message: "User with that email already exists" });
    }

    const hashedPassword = await generatePassword(password);
    const user = await db.User.create({     
        username: username,
        email: email,
        password_hash: hashedPassword
    });

    const token = generateAuthToken(user);

    res.status(201).json({ token });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateAuthToken(user);

        res.status(200).json({ success: true, data: { token } });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// {
//     "username": "freddy",
//     "email": "freddy@gmail.com",
//     "password": "123456"
// }