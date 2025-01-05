const Schedule = require('../models/scheduleModel');

exports.create = async (req, res) => {
    try {
        const { dog_id, schedule_type, description, schedule_date, schedule_time, notification_type, repeat_type, repeat_end_date } = req.body;


        // 현재 시간과 선택된 시간 비교
        const currentDate = new Date();
        const selectedDateTime = new Date(`${schedule_date}T${schedule_time}`);
        const isPastSchedule = selectedDateTime < currentDate;


        // 과거 일정인데 알림을 설정하려는 경우
        if (isPastSchedule && (notification_type !== 'none' || repeat_type !== 'none')) {
            return res.status(400).json({
                success: false,
                message: '이미 완료된 일정은 알림 및 반복 설정을 설정할 수 없습니다.'
            });
        }

        //기본 일정 등록 
        const newSchedule = await Schedule.create({
            dog_id,
            schedule_type,
            description,
            schedule_date,
            schedule_time,
            notification_type: isPastSchedule ? 'none' : notification_type,
            repeat_type: isPastSchedule ? 'none' : repeat_type,
            repeat_end_date,
            is_completed: isPastSchedule // 과거 일정은 자동으로 완료 처리
        });

        const scheduleList = await Schedule.getScheduleList(schedule_date);

        return res.status(201).json({
            success: true,
            message: '스케쥴이 등록되었습니다.',
            result: newSchedule,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '스케쥴 등록 중 오류 발생',
        });
    }

      // 일정 목록 조회
      exports.getScheduleList = async (req, res) => {
        try {
            const { date } = req.params;
            const schedules = await Schedule.getScheduleList(date);

            res.json({
                success: true,
                result: schedules
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
    exports.update = async (req, res) => {
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
    exports.delete = async (req, res) => {
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


};