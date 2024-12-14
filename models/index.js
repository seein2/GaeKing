const db = require('../config/db');

async function initializeDB() {
    try {
        // 가족그룹 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS family (
                id INT PRIMARY KEY AUTO_INCREMENT,
                family_name VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 유저 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_name VARCHAR(10) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255),
                family_id INT NOT NULL,
                -- provider ENUM('local', 'kakao') DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (family_id) REFERENCES family(id)
            );
        `);

        console.log('데이터베이스 테이블 초기화 완료');
    } catch (error) {
        console.log('데이터베이스 초기화 에러:');
        throw error;
    }
}

initializeDB().catch(console.error);
