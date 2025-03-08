const db = require('../config/db');

class Widget {
    // 위젯 설정 페이지 진입 시 모든 위젯의 활성화 상태 확인
    static async getSettings(dogId) {
        const [widgets] = await db.query(`
            SELECT widget_type, is_activated 
            FROM widgets 
            WHERE dog_id = ?
        `, [dogId]);

        const allTypes = ['식사', '산책', '간식', '목욕', '병원', '기타', '생일'];
        const result = {};

        allTypes.forEach(type => {
            const widget = widgets.find(w => w.widget_type === type);
            result[type] = widget ? widget.is_activated : false;
        });

        return result;
        //반환 형태: { '식사': true, '산책': false, ... }
    };

    // 강아지의 활성화된 위젯 정보만 가져오기 
    static async getActiveWidgets(dogId) {

        // 생일을 구하고
        const [dday] = await db.query(`
            SELECT DATE_FORMAT(birth_date, '%m-%d') as dday
            FROM dogs
            WHERE dog_id = ?
        `, [dogId]);
        // 디데이를 구함
        let dDay = null;
        if (dday && dday.length > 0) {
            const birthDateStr = dday[0].dday;
            if (birthDateStr) {
                const today = new Date();
                const currentYear = today.getFullYear();

                // MM-DD 형식의 생일 문자열을 파싱
                const [birthMonth, birthDay] = birthDateStr.split('-').map(num => parseInt(num));

                // 올해 생일 날짜 생성
                let birthDate = new Date(currentYear, birthMonth - 1, birthDay);

                // 만약 올해 생일이 이미 지났다면 내년 생일로 계산
                if (today > birthDate) {
                    birthDate = new Date(currentYear + 1, birthMonth - 1, birthDay);
                }

                // 디데이 계산 (밀리초 단위를 일 단위로 변환)
                const timeDiff = birthDate.getTime() - today.getTime();
                dDay = Math.ceil(timeDiff / (1000 * 3600 * 24));
            }
        }

        const [widgets] = await db.query(`
            SELECT 
                w.widget_type,
                COUNT(si.instance_id) as today_count,
                COUNT(CASE WHEN si.is_completed = true THEN 1 END) as completed_count,
                NULL as birth_date
            FROM widgets w
            LEFT JOIN schedules s ON w.dog_id = s.dog_id AND w.widget_type = s.schedule_type
            LEFT JOIN schedule_instances si ON s.schedule_id = si.schedule_id 
                AND si.scheduled_date = CURRENT_DATE()
                AND si.is_deleted = false
            WHERE w.dog_id = ? AND w.is_activated = true
                AND w.widget_type != '생일'                
            GROUP BY w.widget_type  

            UNION ALL

            SELECT 
                w.widget_type,
                0 as today_count,
                0 as completed_count,
                ? as birth_date
            FROM widgets w
            JOIN dogs d ON w.dog_id = d.dog_id
            WHERE w.dog_id = ? AND w.is_activated = true
                AND w.widget_type = '생일'
        `, [dogId, dDay, dogId]);
        console.log(widgets);
        return widgets;
        //반환 형태: [{ widget_type: '산책', today_count: 3, completed_count: 1 }, ...]
    };

    // 위젯 활성화/비활성화 설정
    static async updateWidget(dogId, widgetType, isActivated) {
        const [result] = await db.query(`
            INSERT INTO widgets (dog_id, widget_type, is_activated)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE is_activated = ?
        `, [dogId, widgetType, isActivated, isActivated]);
        return result;
    };
};

module.exports = Widget;