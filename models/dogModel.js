const db = require('../config/db');

class Dog {
    static async createDog(dog_name, birth_date, breed_type, gender, profile_image, user_id, connection) {
        // ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
        birth_date = new Date(birth_date).toISOString().split('T')[0];
        try {
            const [result] = await connection.query(
                `INSERT INTO dogs (dog_name, birth_date, breed_type, gender, profile_image)
            VALUES(?, ?, ?, ?, ?)`,
                [dog_name, birth_date, breed_type, gender, profile_image]
            );
            console.log('등록성공', result);

            await connection.query(
                `INSERT INTO dog_user(dog_id, user_id) VALUES(?, ?)`,
                [result.insertId, user_id]
            );

            return result.insertId;
        } catch (error) {
            console.error('Model Error:', error); // 구체적인 에러 내용 확인
            throw error;
        }
    };

    static async findById(id) {
        const [dog] = await db.query(
            'SELECT * FROM dogs WHERE dog_id = ?',
            [id]
        );

        const [familyMembers] = await db.query(
            `SELECT u.user_id, u.user_name
            FROM users u 
            JOIN dog_user du ON u.user_id = du.user_id 
            WHERE du.dog_id = ?
            ORDER BY du.created_at`,  // 가입 순서대로 정렬
            [id]
        );
        return {
            dog: dog[0],
            familyMembers
        };
    };

    static async findByUserId(user_id) {
        const [result] = await db.query(
            `SELECT * FROM dogs d JOIN dog_user du ON d.dog_id = du.dog_id
            WHERE du.user_id = ?`,
            [user_id]
        );
        return result;
    };

    static async updateDog(id, { dog_name, birth_date, breed_type, gender, profile_image }) {
        // 1. 먼저 현재 데이터를 조회
        const [currentDog] = await db.query(
            `SELECT * FROM dogs WHERE dog_id = ?`,
            [id]
        );

        // 2. 새로운 값이 없으면 기존 값을 사용
        const updatedData = {
            dog_name: dog_name || currentDog[0].dog_name,
            birth_date: birth_date ? new Date(birth_date).toISOString().split('T')[0] : currentDog[0].birth_date,
            breed_type: breed_type || currentDog[0].breed_type,
            gender: gender || currentDog[0].gender,
            profile_image: profile_image || currentDog[0].profile_image
        };

        // 3. 업데이트 실행
        const [result] = await db.query(
            `UPDATE dogs SET 
                dog_name = ?, 
                birth_date = ?, 
                breed_type = ?, 
                gender = ?, 
                profile_image = ?
            WHERE dog_id = ?`,
            [updatedData.dog_name,
            updatedData.birth_date,
            updatedData.breed_type,
            updatedData.gender,
            updatedData.profile_image,
                id]
        );
        return result;
    };

    // dog_user 테이블부터 삭제
    static async deleteDog(id, connection) {
        // 트랜잭션 작업을 하기 때문에 connection 사용
        await connection.query(
            `DELETE FROM dog_user WHERE dog_id = ?`,
            [id]
        );
        const [result] = await connection.query(
            `DELETE FROM dogs WHERE dog_id = ?`,
            [id]
        );
        return result;
    };

    // 사용자의 강아지인지 확인
    static async checkOwner(dogId, userId, connection) {
        const [rows] = await connection.query(
            `SELECT * FROM dog_user WHERE dog_id = ? AND user_id = ?`,
            [dogId, userId]
        );
        return rows.length > 0;
    };

    // 초대 코드 생성
    static async invitation(dogId, connection) {
        const createCode = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        const codeTime = new Date(Date.now() + 3*60*1000);
        const code = createCode();
        
        await connection.query(
            `INSERT INTO dog_invitation(dog_id, code, codeTime) VALUES(?, ?, ?)`,
            [dogId, code, codeTime]
        );

        return code;
    };

    // 초대 코드 확인
    static async check(code) {
        const [result] = await db.query(
            `SELECT * FROM dog_invitation WHERE code = ? AND is_used  = FALSE AND codeTime > CURRENT_TIMESTAMP`,
            [code]
        );
        return result;
    };

    // 초대 코드 허락
    static async accept(dogId, userId, code, connection) {
        await connection.query(
            `INSERT INTO dog_user(dog_id, user_id) VALUES(?, ?)`,
            [dogId, userId]
        );

        await connection.query(
            'UPDATE dog_invitation SET is_used = TRUE WHERE code = ?',
            [code]
        );
    };



};

module.exports = Dog;