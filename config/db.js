const mysql = require('mysql2/promise');
const dbConfig = require('./db.config')[process.env.NODE_ENV || 'development'];
const pool = mysql.createPool(dbConfig);

async function dbConnect() {
    try {
        const connection = await pool.getConnection();
        console.log('db 연결 성공');
        connection.release();
    } catch (error) {
        console.log('db 연결 실패');
        throw error;
    }
}

dbConnect().catch(console.error); // 연결 확인

module.exports = pool;