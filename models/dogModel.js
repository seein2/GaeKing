const db = require('../config/db');

class Dog {
    static async createDog(dog_name, birth_date, breed_type, gender, profile_image, user_id) {

        await db.beginTransaction(); // 트랜잭션 시작

        const [result] = await db.query(
            `INSERT INTO dogs (dog_name, birth_date, breed_type, gender, profile_image)
            VALUES(?, ?, ?, ?, ?)`,
            [dog_name, birth_date, breed_type, gender, profile_image]
        );

        await db.query(
            `INSERT INTO dog_user(dog_id, user_id) VALUES(?, ?)`,
            [result.insertId, user_id]
        );

        await db.commit(); // 성공하면 커밋

        return result.insertId;
    }

    static async findById(id) {
        const [result] = await db.query(
            `SELECT * FROM dogs WHERE id = ?`,
            [id]
        );
        return result[0];
    }

    static async updateDog(id, { dog_name, birth_date, breed_type, gender, profile_image }) {
        const [result] = await db.query(
            `UPDATE dogs SET dog_name = ?, birth_date = ?, breed_type = ?, gender = ?, profile_image = ?
            WHERE id = ?`,
            [dog_name, birth_date, breed_type, gender, profile_image, id]
        );
        return result;
    }

    static async deleteDog(id) {
        const [result] = await db.query(
            `DELETE FROM dogs where id = ?`,
            [id]
        );
        return result;
    }

};

module.exports = Dog;