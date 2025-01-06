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

        // ----------------------스케쥴 관련 테이블----------------------
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                schedule_id INT PRIMARY KEY AUTO_INCREMENT,
                dog_id INT NOT NULL,
                schedule_type ENUM('식사', '산책', '간식', '목욕', '병원', '기타') NOT NULL,
                description TEXT,
                schedule_date DATE NOT NULL,
                schedule_time TIME NOT NULL,
                is_completed BOOLEAN NOT NULL, -- 완료 여부(식사나 산책은 true, 병원같은건 false로)
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (dog_id) REFERENCES dogs(dog_id) ON DELETE CASCADE
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule_repeats (
                repeat_id INT PRIMARY KEY AUTO_INCREMENT,
                schedule_id INT NOT NULL,
                repeat_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
                repeat_end_date DATE,
                FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule_notifications (
                notification_id INT PRIMARY KEY AUTO_INCREMENT,
                schedule_id INT NOT NULL,
                notification_type ENUM('none', '10_minutes', '30_minutes', '60_minutes') NOT NULL,
                FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
            );
        `);
        // ----------------------스케쥴 관련 테이블----------------------

        // 리프레시토큰 테이블
        await db.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id VARCHAR(100),
                token VARCHAR(255),
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        `);

        console.log('데이터베이스 테이블 초기화 완료');
    } catch (error) {
        console.log('데이터베이스 초기화 에러:');
        throw error;
    }
}

initializeDB().catch(console.error);
