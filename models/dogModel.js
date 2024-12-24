const db = require('../config/db');

class Dog {
    static async createDog(dog_name, birth_date, breed_type, gender, profile_image) {
        const [result] = db.query(
            `INSERT INTO dogs (dog_name, birth_date, breed_type, gender, profile_image)
            VALUES(?, ?, ?, ?, ?)`,
            [dog_name, birth_date, breed_type, gender, profile_image]
        );
        return result.insertId;
    }

    static async findById(id){
        const[result] = db.query(
            `SELECT * FROM dogs WHERE id = ?`,
            [id]
        );
        return result[0];
    }

};

module.exports = Dog;