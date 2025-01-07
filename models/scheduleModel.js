const db = require('../config/db');

class Schedule {
    //일정 등록
    static async create({ dog_id, type, date, description, repeat, times, notification }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. 기본 스케줄 생성
            const [scheduleResult] = await connection.query(
                `INSERT INTO schedules (dog_id, schedule_type, description, schedule_date)
                 VALUES (?, ?, ?, ?)`,
                [dog_id, type, description, date]
            );
            const scheduleId = scheduleResult.insertId;

            // 2. 반복 설정 생성 (있는 경우)
            // repeat_count는 하루에 반복하는 횟수
            if (repeat && repeat.type !== 'none') {
                await connection.query(
                    `INSERT INTO schedule_repeats (schedule_id, repeat_type, repeat_count)
                     VALUES (?, ?, ?)`,
                    [scheduleId, repeat.type, repeat.count || null]
                );
            };

            // 3. 알림 설정 생성 (있는 경우)
            if (notification?.enabled) {
                await connection.query(
                    `INSERT INTO schedule_notifications (schedule_id, enabled, minutes)
                     VALUES (?, true, ?)`,
                    [scheduleId, notification.minutes]
                );
            };

            // 4. 인스턴스 생성
            const instances = [];

            // 반복 날짜 계산 (3개월) 
            let dates = [date];
            if (repeat && repeat.type !== 'none') {
                dates = this.#generateRepeatDates(date, repeat.type);
            };

            // 시간 설정이 있는 경우
            if (times && times.length > 0) {
                for (const currentDate of dates) {
                    for (const time of times) {
                        instances.push([
                            scheduleId,
                            currentDate,
                            `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
                        ]);
                    };
                };
            } else {// 시간 설정이 없는 경우
                for (const currentDate of dates) {
                    instances.push([scheduleId, currentDate, null]);
                };
            };

            // 인스턴스 벌크 삽입
            if (instances.length > 0) {
                await connection.query(
                    `INSERT INTO schedule_instances (schedule_id, scheduled_date, scheduled_time)
                     VALUES ?`,
                    [instances]
                );
            };

            await connection.commit();
            return scheduleId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        };
    };

    // 반복 날짜 생성 헬퍼 함수 (3개월로 고정) -- private helper method
    static #generateRepeatDates(startDate, repeatType) {
        const dates = [startDate];
        const date = new Date(startDate);
        const endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 3);  // 3개월 후

        while (date < endDate) {
            switch (repeatType) {
                case 'daily':
                    date.setDate(date.getDate() + 1);
                    break;
                case 'weekly':
                    date.setDate(date.getDate() + 7);
                    break;
                case 'monthly':
                    date.setMonth(date.getMonth() + 1);
                    break;
            };

            if (date < endDate) {
                dates.push(date.toISOString().split('T')[0]);
            };
        };

        return dates;
    };


    //일정 조회
    static async getScheduleList(scheduleDate) {
        const [schedules] = await db.query(
            `SELECT 
                s.schedule_id,
                d.dog_id,
                d.dog_name,
                s.schedule_type,
                s.description,
                sn.enabled as notification_enabled,
                sn.minutes as notification_minutes,
                si.scheduled_time,
                sr.repeat_type,
                sr.repeat_count
            FROM schedules s
            JOIN dogs d ON s.dog_id = d.dog_id
            LEFT JOIN schedule_notifications sn ON s.schedule_id = sn.schedule_id
            LEFT JOIN schedule_repeats sr ON s.schedule_id = sr.schedule_id
            LEFT JOIN schedule_instances si ON s.schedule_id = si.schedule_id
            WHERE si.scheduled_date = ?
            ORDER BY si.scheduled_time, d.dog_name ASC`,
            [scheduleDate]
        );
        return schedules;
    };

    static async getScheduleDetail(schedule_id) {
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
            [schedule_id]
        );
        return schedules[0];
    };

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
            };

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
            };

            await db.commit();

            // 4. 수정된 스케줄 정보 조회하여 반환
            return await this.getScheduleDetail(scheduleId);

        } catch (error) {
            await db.rollback();
            throw error;
        };
    };

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
        };
    };

};

module.exports = Schedule;