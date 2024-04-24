// database.js

const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
    host: '127.0.0.1',
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
function getRecord(table, conditions, callback) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    // 构建WHERE子句
    const whereClause = keys.map(key => `${key} = ?`).join(' AND ');

    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    pool.query(query, values, (error, results) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, results[0]);
    });
}

// 添加记录
function addRecord(table, data, callback) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');  // 为每个值创建一个占位符

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            callback(error, null);  // 传递错误给回调函数
            return;
        }
        callback(null, results);
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
    getRecord,
    addRecord,
    updateRecord,
    deleteRecord
};
