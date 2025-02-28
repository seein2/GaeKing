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

    // 각 강아지의 활성화된 위젯 조회
    static async getWidgets(dogId) {
        const [widgets] = await db.query(
            `SELECT schedule_type FROM dog_widgets WHERE dog_id = ? AND is_active = TRUE`,
            [dogId]
        );
        return widgets;
    };

    
    // 위젯 활성화/비활성화
    static async toggleWidget(dogId, schedule_type, is_active) {
        const [result] = await db.query(
            `INSERT INTO dog_widgets(dog_id, schedule_type, is_active)
            VALUES(?, ?, ?)
            ON DUPLICATE KEY UPDATE is_active = ?`,
            [dogId, schedule_type, is_active, is_active]
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

    // 초대
    static async createInvitation(dogId, userId) {
        // 권한 체크
        const [owner] = await db.query(
            'SELECT * FROM dog_user WHERE dog_id = ? AND user_id = ?',
            [dogId, userId]
        );

        if (!owner) {
            throw new Error('초대 코드 생성 권한이 없습니다.');
        }
        return await this.generateInvitationCode(dogId);
    };

    // 초대코드 발급
    static async generateInvitationCode(dogId) {
        // 코드 생성 함수
        const createCode = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        const codeTime = new Date(Date.now() + 3 * 60 * 1000);
        const code = createCode();

        await db.query(
            `INSERT INTO dog_invitations(dog_id, code, codeTime) VALUES(?, ?, ?)`,
            [dogId, code, codeTime]
        );

        return code;
    };

    static async acceptInvitation(code, userId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 초대 코드 확인
            const [invitation] = await connection.query(
                `SELECT * FROM dog_invitations WHERE code = ? AND is_used = FALSE AND codeTime > CURRENT_TIMESTAMP`,
                [code]
            );

            if (!invitation) {
                throw new Error('초대 코드가 유효하지 않습니다.');
            }

            // 이미 멤버인지 확인
            const [existingMember] = await connection.query(
                `SELECT * FROM dog_user WHERE dog_id = ? AND user_id = ?`,
                [invitation.dog_id, userId]
            );

            if (existingMember) {
                throw new Error('이미 등록된 사용자입니다.');
            }

            // 멤버 추가 및 초대 코드 사용 처리
            await connection.query(
                `INSERT INTO dog_user(dog_id, user_id) VALUES(?, ?)`,
                [invitation.dog_id, userId]
            );

            await connection.query(
                'UPDATE dog_invitations SET is_used = TRUE WHERE code = ?',
                [code]
            );

            // 강아지 정보 조회
            const [dogInfo] = await connection.query(
                'SELECT * FROM dogs WHERE dog_id = ?',
                [invitation.dog_id]
            );

            await connection.commit();
            return dogInfo;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

};

module.exports = Dog;