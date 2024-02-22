const { pool } = require('../../db');

async function getAllUsers() {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
}

async function getOneUser(userId) {
    console.log(userId);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log(result.rows[0])
    return result.rows[0];
}

module.exports = {
  getAllUsers,
  getOneUser,
//   create,
//   update,
//   remove,
};