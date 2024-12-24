const db = require('../config/db');

class Dog {
    static async createDog(dog_name, birth_date, breed_type, gender, profile_image) {
        const [result] = await db.query(
            `INSERT INTO dogs (dog_name, birth_date, breed_type, gender, profile_image)
            VALUES(?, ?, ?, ?, ?)`,
            [dog_name, birth_date, breed_type, gender, profile_image]
        );
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
        const dog = await this.findById(id);
        if (!dog) {
            throw new Error('강아지를 찾을 수 없습니다.');
        }

        const [result] = await db.query(
            `DELETE FROM dogs where id = ?`,
            [id]
        );
        return result;
    }

};

module.exports = Dog;