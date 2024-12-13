require('dotenv').config();

module.exports = {
    development: { // 개발 환경
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0
    },
    production: { // 운영 환경

    }
};