const db = require('../config/db');

async function initializeDB() {
    try {
        // 강아지 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS dogs (
                dog_id INT PRIMARY KEY AUTO_INCREMENT,
                dog_name VARCHAR(50) NOT NULL,
                birth_date DATE,
                breed_type VARCHAR(50),
                gender ENUM('MALE', 'FEMALE'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 유저 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS users ( 
                user_id VARCHAR(50) PRIMARY KEY NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                user_name VARCHAR(10) NOT NULL UNIQUE,
                -- provider ENUM('local', 'kakao') DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 강아지-사용자 관계 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS dog_user (
                dog_id INT,
                user_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (dog_id, user_id),
                FOREIGN KEY (dog_id) REFERENCES dogs(dog_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
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
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `);

        console.log('데이터베이스 테이블 초기화 완료');
    } catch (error) {
        console.log('데이터베이스 초기화 에러:');
        throw error;
    }
}

initializeDB().catch(console.error);
