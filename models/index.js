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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (dog_id) REFERENCES dogs(dog_id) ON DELETE CASCADE
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule_repeats ( -- 스케쥴 반복 테이블
                repeat_id INT PRIMARY KEY AUTO_INCREMENT,
                schedule_id INT NOT NULL,
                repeat_type ENUM('none', 'daily', 'weekly', 'monthly') NOT NULL,
                repeat_count INT CHECK (repeat_count BETWEEN 1 AND 5),  -- daily 반복일 때 사용
                FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule_notifications ( -- 스케쥴 알림 테이블
                notification_id INT PRIMARY KEY AUTO_INCREMENT,
                schedule_id INT NOT NULL,
                enabled BOOLEAN NOT NULL DEFAULT FALSE,
                minutes INT CHECK (minutes IN (0, 10, 30, 60)) NOT NULL,
                FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS schedule_instances ( -- 실제 스케줄 발생 정보
                instance_id INT PRIMARY KEY AUTO_INCREMENT,
                schedule_id INT NOT NULL,
                scheduled_date DATE NOT NULL,
                scheduled_time TIME,
                is_deleted BOOLEAN DEFAULT FALSE, -- 개별 삭제 관리
                is_completed BOOLEAN DEFAULT FALSE, -- 상태 관리
                completion_time DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
                INDEX idx_schedule_date (schedule_id, scheduled_date)
            );
        `);
        // ----------------------스케쥴 관련 테이블----------------------

        //사용자 초대
        await db.query(`
            CREATE TABLE IF NOT EXISTS dog_invitations (
                dog_id INT NOT NULL, 
                code VARCHAR(8) NOT NULL UNIQUE, 
                is_used BOOLEAN DEFAULT FALSE, 
                codeTime TIMESTAMP NOT NULL,  
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dog_id) REFERENCES dogs(dog_id) ON DELETE CASCADE
            );
        `)

        // ----------------------위젯 관련 테이블----------------------
        await db.query(`
            CREATE TABLE IF NOT EXISTS widgets (
                type_id INT PRIMARY KEY AUTO_INCREMENT,
                type_name VARCHAR(50) NOT NULL,
                description TEXT,
                icon VARCHAR(100)
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query(` 
            CREATE TABLE IF NOT EXISTS dog_widget (
                dog_id INT,
                schedule_type ENUM('식사', '산책', '간식', '목욕', '병원', '기타') NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (dog_id, schedule_type),
                FOREIGN KEY (dog_id) REFERENCES dogs(dog_id) ON DELETE CASCADE
            );
        `)

        // ----------------------위젯 관련 테이블----------------------

        

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
