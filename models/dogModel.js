const db = require('../config/db');

class Dog {
    static async createDog(dog_name, birth_date, breed_type, gender, profile_image, user_id, connection) {
        // ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
        birth_date = new Date(birth_date).toISOString().split('T')[0];
        console.log('유저아이디!!!!!!!!!!',user_id);
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
            console.log('관계테이블도 성공');

            return result.insertId;
        } catch (error) {
            console.error('Model Error:', error); // 구체적인 에러 내용 확인
            throw error;
        }
    }

    static async findById(id) {
        const [result] = await db.query(
            `SELECT * FROM dogs WHERE dog_id = ?`,
            [id]
        );
        return result[0];
    }

    static async updateDog(id, { dog_name, birth_date, breed_type, gender, profile_image }) {
        const [result] = await connection.query(
            `UPDATE dogs SET dog_name = ?, birth_date = ?, breed_type = ?, gender = ?, profile_image = ?
            WHERE dog_id = ?`,
            [dog_name, birth_date, breed_type, gender, profile_image, id]
        );
        return result;
    }

    static async deleteDog(id) {
        const [result] = await connection.query(
            `DELETE FROM dogs where dog_id = ?`,
            [id]
        );
        return result;
    }

};

module.exports = Dog;