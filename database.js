// database.js

const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'chatgpt',
    password: '123456',
    database: 'chatgpt',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// 获取所有记录
function getAll(table, callback) {
    pool.query(`SELECT * FROM ${table}`, (error, results) => {
        callback(error, results);
    });
}

// 通过ID获取记录
function getById(table, id, callback) {
    pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (error, results) => {
        callback(error, results[0]);
    });
}

// 添加记录
function addRecord(table, data, callback) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    pool.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (?)`, [values], (error, results) => {
        callback(error, results.insertId);
    });
}

// 更新记录
function updateRecord(table, id, data, callback) {
    const entries = Object.entries(data);
    const updates = entries.map(([key, val]) => `${key} = ?`).join(', ');
    const values = [...entries.map(entry => entry[1]), id];
    pool.query(`UPDATE ${table} SET ${updates} WHERE id = ?`, values, (error, results) => {
        callback(error, results.affectedRows);
    });
}

// 删除记录
function deleteRecord(table, id, callback) {
    pool.query(`DELETE FROM ${table} WHERE id = ?`, [id], (error, results) => {
        callback(error, results.affectedRows);
    });
}

module.exports = {
    getAll,
    getById,
    addRecord,
    updateRecord,
    deleteRecord
};