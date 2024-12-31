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
                gender ENUM('남자', '여자'),
                profile_image VARCHAR(100),
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

        // 스케쥴 테이블
        // 내가(지피티가) 생각한건 이 구성인데 너가 생각하고 수정해보셈
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                schedule_id INT PRIMARY KEY AUTO_INCREMENT,
                dog_id INT NOT NULL,
                schedule_type ENUM('식사', '산책', '간식', '목욕', '병원', '기타'),
                title VARCHAR(100),
                description TEXT,
                schedule_date DATE NOT NULL,         -- 2024-12-31
                schedule_time TIME NOT NULL,         -- 13:00:00
                duration INT DEFAULT 30,             -- 기본 30분
                is_repeated BOOLEAN DEFAULT FALSE,
                repeat_days VARCHAR(50),             -- 요일 정보 (예: "1,3,5" -> 월,수,금)
                is_completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (dog_id) REFERENCES dogs(dog_id)
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
