const db = require('../../db');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newUser = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, password]);
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    registerUser
};