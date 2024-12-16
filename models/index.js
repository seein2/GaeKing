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
            CREATE TABLE IF NOT EXISTS users ( 
                id VARCHAR(100) PRIMARY KEY NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                user_name VARCHAR(10) NOT NULL UNIQUE,
                family_id INT,
                -- provider ENUM('local', 'kakao') DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (family_id) REFERENCES family(id)
            );
        `);

        // 리프레시토큰 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id VARCHAR(100),
                token VARCHAR(255),
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);

        console.log('데이터베이스 테이블 초기화 완료');
    } catch (error) {
        console.log('데이터베이스 초기화 에러:');
        throw error;
    }
}

initializeDB().catch(console.error);
