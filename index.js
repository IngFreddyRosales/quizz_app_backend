require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./model/');
const cors = require('cors');

const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.sequelize.sync({}).then(() => {
    console.log('Database synchronized successfully.');
});


require('./routes')(app);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Quiz App API!');
});