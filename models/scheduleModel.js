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

            // 2. 반복 설정 생성
            if (repeat && repeat.type !== 'none') {
                await connection.query(
                    `INSERT INTO schedule_repeats (schedule_id, repeat_type, repeat_count)
                     VALUES (?, ?, ?)`,
                    [scheduleId, repeat.type, repeat.count || null]
                );
            };

            // 3. 알림 설정 생성
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
            const dates = repeat && repeat.type !== 'none'
                ? this.#generateRepeatDates(date, repeat.type)
                : [date];

            // 시간 설정이 있는 경우
            if (times && times.length > 0) {
                for (const currentDate of dates) {
                    for (const time of times) {
                        const instance = [
                            scheduleId,
                            currentDate,
                            `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
                        ];
                        instances.push(instance);
                        console.log('생성된 인스턴스:', instance);
                    }
                }
            } else { // 시간 설정이 없는 경우
                for (const currentDate of dates) {
                    const count = (repeat?.type === 'daily' ? repeat.count : 1) || 1;
                    for (let i = 0; i < count; i++) {
                        const instance = [scheduleId, currentDate, null];
                        instances.push(instance);
                    }
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


    // 일정 조회
    static async getScheduleList(scheduleDate) {
        const [schedules] = await db.query(
            `SELECT 
                s.schedule_id,
                d.dog_id,
                d.dog_name,
                s.schedule_type,
                s.description,
                MAX(sn.enabled) as notification_enabled,
                MAX(sn.minutes) as notification_minutes,
                MIN(si.scheduled_time) as scheduled_time,
                MAX(sr.repeat_type) as repeat_type,
                MAX(sr.repeat_count) as repeat_count
            FROM schedules s
            JOIN dogs d ON s.dog_id = d.dog_id
            LEFT JOIN schedule_notifications sn ON s.schedule_id = sn.schedule_id
            LEFT JOIN schedule_repeats sr ON s.schedule_id = sr.schedule_id
            LEFT JOIN schedule_instances si ON s.schedule_id = si.schedule_id
            WHERE si.scheduled_date = ?
            GROUP BY 
                s.schedule_id,
                d.dog_id,
                d.dog_name,
                s.schedule_type,
                s.description
            ORDER BY MIN(si.scheduled_time), d.dog_name ASC
        `,
            [scheduleDate]
        );
        return schedules;
    };

    // 일정 상세
    static async getScheduleDetail(schedule_id, date) {
        const [schedules] = await db.query(
            `SELECT 
                s.schedule_id,
                d.dog_id,
                d.dog_name,
                s.schedule_type,
                s.description,
                si.instance_id,
                si.scheduled_time,
                si.is_completed,
                si.completed_time,
                sr.repeat_type,
                sn.enabled as notification_enabled,
                sn.minutes as notification_minutes
            FROM schedules s
            JOIN dogs d ON s.dog_id = d.dog_id
            JOIN schedule_instances si ON s.schedule_id = si.schedule_id
            LEFT JOIN schedule_repeats sr ON s.schedule_id = sr.schedule_id
            LEFT JOIN schedule_notifications sn ON s.schedule_id = sn.schedule_id
            WHERE s.schedule_id = ?
            AND si.scheduled_date = ?
            AND si.is_deleted = FALSE
            ORDER BY si.scheduled_time`,
            [schedule_id, date]
        );

        // 결과가 없는 경우
        if (!schedules || schedules.length === 0) {
            return null;
        }

        // 기본 스케줄 정보는 한 번만
        const schedule = {
            schedule_id: schedules[0].schedule_id,
            dog_id: schedules[0].dog_id,
            dog_name: schedules[0].dog_name,
            schedule_type: schedules[0].schedule_type,
            description: schedules[0].description,
            repeat_type: schedules[0].repeat_type,
            notification: {
                enabled: schedules[0].notification_enabled,
                minutes: schedules[0].notification_minutes
            },
            // 해당 날짜의 모든 인스턴스
            instances: schedules.map(item => ({
                instance_id: item.instance_id,
                scheduled_time: item.scheduled_time,
                is_completed: item.is_completed,
                completed_time: item.completed_time
            }))
        };
        console.log(schedule);
        return schedule;
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

    static async completionSchedule(instance_id, is_completed) {
        try {
            const [result] = await db.query(
                `UPDATE schedule_instances
                SET is_completed = ?, completed_time = ?
                WHERE instance_id = ?`,
                [is_completed, is_completed ? new Date() : null, instance_id]
            );

            return result;
        } catch (error) {
            throw error;
        }
    };

};

module.exports = Schedule;