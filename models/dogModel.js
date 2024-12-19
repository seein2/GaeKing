const db = require('../config/db');

class Dog {
    static async createDog(dog_name, birth_date, breed_type, gender) {
        const [result] = db.query(
            `INSERT INTO dogs (dog_name, birth_date, breed_type, gender)
            VALUES(?, ?, ?, ?)`,
            [dog_name, birth_date, breed_type, gender]
        );
        return result.insertId;
    }

};

module.exports = Dog;