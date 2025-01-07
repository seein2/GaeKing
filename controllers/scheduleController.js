const Schedule = require('../models/scheduleModel');

exports.create = async (req, res) => {
    try {
        const { dog_id, type, date, description, repeat, times, notification } = req.body;
        const newSchedule = await Schedule.create({
            dog_id,
            type,
            date,
            description,
            repeat,
            times,
            notification
        });
        return res.status(201).json({
            success: true,
            message: '스케줄이 등록되었습니다.',
            result: newSchedule,
        });
    } catch (error) {
        console.error('스케줄 등록 에러:', error);
        res.status(500).json({
            success: false,
            message: '스케줄 등록 중 오류 발생',
        });
    }
};

// 스케쥴 목록 조회
exports.getScheduleList = async (req, res) => {
    try {
        const { date } = req.params;
        const schedules = await Schedule.getScheduleList(date);

        res.json({
            success: true,
            message: '스케쥴 목록 조회 성공',
            result: schedules,
        });

    } catch (error) {
        console.error('스케줄 목록 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '스케줄 목록 조회 중 오류가 발생했습니다.'
        });
    }
};

// 일정 상세 조회
exports.getScheduleDetail = async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const schedule = await Schedule.getScheduleDetail(schedule_id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '해당 스케줄을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            result: schedule
        });

    } catch (error) {
        console.error('스케줄 상세 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '스케줄 상세 조회 중 오류가 발생했습니다.'
        });
    }
};

// 일정 수정
exports.updateSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.schedule_id;
        const { schedule_type, description, schedule_date, schedule_time, notification_type, repeat_type, repeat_end_date, is_completed } = req.body;

        const updatedSchedule = await Schedule.update({
            scheduleId,
            schedule_type,
            description,
            schedule_date,
            schedule_time,
            notification_type,
            repeat_type,
            repeat_end_date,
            is_completed
        });

        res.json({
            success: true,
            message: '스케줄이 수정되었습니다.',
            result: updatedSchedule
        });

    } catch (error) {
        console.error('스케줄 수정 에러:', error);
        res.status(500).json({
            success: false,
            message: '스케줄 수정 중 오류가 발생했습니다.'
        });
    }
};

// 일정 삭제
exports.removeSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.schedule_id;
        const result = await Schedule.delete(scheduleId);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: '스케줄이 삭제되었습니다.'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '해당 스케줄을 찾을 수 없습니다.'
            });
        }

    } catch (error) {
        console.error('스케줄 삭제 에러:', error);
        res.status(500).json({
            success: false,
            message: '스케줄 삭제 중 오류가 발생했습니다.'
        });
    }
};
