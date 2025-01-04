const db = require('../config/db');

class Schedule {
    static async create({ dog_id, schedule_type, description, schedule_date, schedule_time, is_completed }) {
        const [result] = await db.query(
            `INSERT INTO schedules
                (dog_id, schedule_type, description, schedule_date, schedule_time, is_completed)
                VALUES (?,?,?,?,?,?)`,
            [dog_id, schedule_type, description, schedule_date, schedule_time, is_completed]
        );

        return result.insertId;
    }

    static async completedButton(schedule_id) {
        const [result] = await db.query(
            `UPDATE schedules 
            SET is_completed = true,
                notification_type = 'none',
                repeat_type = 'none',
                completed_at = NOW()
            WHERE schedule_id = ?`,
            [schedule_id]
        );

        await db.query(
            `DELETE FROM notifications 
            WHERE schedule_id = ? 
            AND is_sent = false`,
            [schedule_id]
        );
    }

    static async getByDogAndDate(dog_id, schedule_date) {
        const [result] = await db.query(
            `SELECT * FROM schedules 
            WHERE dog_id = ? 
            AND schedule_date = ?
            ORDER BY schedule_time ASC`,
            [dog_id, date]
        );
        return result;
    }
};

module.exports = Schedule;