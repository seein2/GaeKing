const db = require('../config/db');

class Schedule {

    //일정 등록
    static async create({ dog_id, schedule_type, description, schedule_date, schedule_time, notification_type, repeat_type, repeat_end_date, is_completed }) {
        try {
            await db.beginTransaction();

            // 1. 기본 스케줄 생성
            const [scheduleResult] = await db.query(
                `INSERT INTO schedules
                    (dog_id, schedule_type, description, schedule_date, schedule_time, is_completed)
                    VALUES (?,?,?,?,?,?)`,
                [dog_id, schedule_type, description, schedule_date, schedule_time, is_completed]
            );

            const scheduleId = scheduleResult.insertId;

            // 2. 알림 설정 생성
            if (!is_completed && notification_type && notification_type !== 'none') {
                await db.query(
                    `INSERT INTO schedule_notifications
                        (schedule_id, notification_type)
                        VALUES (?, ?)`,
                    [scheduleId, notification_type]
                );
            }

            // 3. 반복 설정 생성
            if (!is_completed && repeat_type && repeat_type !== 'none') {
                await db.query(
                    `INSERT INTO schedule_repeats
                        (schedule_id, repeat_type, repeat_end_date)
                        VALUES (?, ?, ?)`,
                    [scheduleId, repeat_type, repeat_end_date]
                );
            }

            await db.commit();

            // 4. 생성된 스케줄 정보 조회하여 반환
            const newSchedule = await this.getScheduleDetail(scheduleId);
            return newSchedule;

        } catch (error) {
            await db.rollback();
            throw error;  // 에러를 상위로 전파
        }
    }

    // 일정 수정
    static async update({ scheduleId, schedule_type, description, schedule_date, schedule_time, notification_type, repeat_type, repeat_end_date, is_completed }) {
        try {
            await db.beginTransaction();

            // 1. 기본 스케줄 정보 수정
            await db.query(
                `UPDATE schedules 
             SET schedule_type = ?, 
                 description = ?, 
                 schedule_date = ?, 
                 schedule_time = ?, 
                 is_completed = ?
             WHERE schedule_id = ?`,
                [schedule_type, description, schedule_date, schedule_time, is_completed, scheduleId]
            );

            // 2. 알림 설정 수정 (기존 설정 삭제 후 새로 생성)
            await db.query(
                `DELETE FROM schedule_notifications WHERE schedule_id = ?`,
                [scheduleId]
            );

            if (!is_completed && notification_type && notification_type !== 'none') {
                await db.query(
                    `INSERT INTO schedule_notifications (schedule_id, notification_type)
                 VALUES (?, ?)`,
                    [scheduleId, notification_type]
                );
            }

            // 3. 반복 설정 수정 (기존 설정 삭제 후 새로 생성)
            await db.query(
                `DELETE FROM schedule_repeats WHERE schedule_id = ?`,
                [scheduleId]
            );

            if (!is_completed && repeat_type && repeat_type !== 'none') {
                await db.query(
                    `INSERT INTO schedule_repeats (schedule_id, repeat_type, repeat_end_date)
                 VALUES (?, ?, ?)`,
                    [scheduleId, repeat_type, repeat_end_date]
                );
            }

            await db.commit();

            // 4. 수정된 스케줄 정보 조회하여 반환
            return await this.getScheduleDetail(scheduleId);

        } catch (error) {
            await db.rollback();
            throw error;
        }
    }

    //일정 조회
    static async getScheduleList(scheduleDate) {
        const [schedules] = await db.query(
            `SELECT 
                s.schedule_id,
                d.dog_name,
                s.schedule_type,
                s.schedule_time,
                s.is_completed
            FROM schedules s
            JOIN dogs d ON s.dog_id = d.dog_id
            WHERE s.schedule_date = ?
            ORDER BY d.dog_id ASC`,
            [scheduleDate]
        );

        return schedules;
    }

    static async getScheduleDetail(scheduleId) {
        const [schedules] = await db.query(
            `SELECT 
                s.schedule_id,
                d.dog_name,
                s.schedule_type,
                s.description,
                s.schedule_date,
                s.schedule_time,
                s.is_completed,
                n.notification_type,
                r.repeat_type,
                r.repeat_end_date
            FROM schedules s
            JOIN dogs d ON s.dog_id = d.dog_id
            LEFT JOIN schedule_notifications n ON s.schedule_id = n.schedule_id
            LEFT JOIN schedule_repeats r ON s.schedule_id = r.schedule_id
            WHERE s.schedule_id = ?`,
            [scheduleId]
        );

        return schedules[0];
    }

    static async delete(scheduleId) {
        try {
            await db.beginTransaction();

            const [result] = await db.query(
                `DELETE FROM schedules WHERE schedule_id = ?`,
                [scheduleId]
            );

            await db.commit();

            return result;

        } catch (error) {
            await db.rollback();
            throw error;
        }
    }

}

module.exports = Schedule;