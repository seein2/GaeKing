require('dotenv').config();

module.exports = {
    development: { // 개발 환경
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 10, // 최대 10개 연결
        waitForConnections: true, // 연결 풀이 가득차면 대기
        queueLimit: 0 // 대기 큐 제한 x
    },
    production: { // 운영 환경

    }
};