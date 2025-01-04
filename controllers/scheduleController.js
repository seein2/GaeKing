const Schedule = require('../models/scheduleModel');

exports.register = async (req, res) => {
    try {
        const { dog_id, schedule_type, description, schedule_date, schedule_time, notification_type } = req.body;

        //기본 일정 등록
        const schedule_id = await Schedule.create({
            dog_id,
            schedule_type,
            description,
            schedule_date,
            schedule_time,
            notification_type: isPastSchedule ? 'none' : notification_type,
            repeat_type: isPastSchedule ? 'none' : repeat_type,
            is_completed: isPastSchedule // 과거 일정은 자동으로 완료 처리
        });

        // 완료 버튼 누를 경우
        if (isPastSchedule) {
            await Schedule.completedButton(schedule_id)
        }

        // 현재 시간과 선택된 시간 비교
        const currentDate = new Date();
        const selectedDateTime = new Date(`${schedule_date}T${schedule_time}`);
        const isPastSchedule = selectedDateTime < currentDate;

        // 과거 일정인데 알림을 설정하려는 경우
        if (isPastSchedule && notification_type !== 'none') {
            return res.status(400).json({
                success: false,
                message: '이미 완료된 일정은 알림 및 반복 설정을 설정할 수 없습니다.'
            });
        }

        // 특정 강아지(dog_id)의 특정 날짜(schedule_date)에 해당하는 모든 일정을 조회
        const newSchedule = await Schedule.getByDogAndDate(dog_id, schedule_date);

        return res.status(201).json({
            success: true,
            message: '스케쥴이 등록되었습니다.',
            result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '스케쥴 등록 중 오류 발생',
        });
    }
};