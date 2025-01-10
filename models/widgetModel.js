const db = require('../config/db');

class Widget {
    // 위젯 설정 페이지 진입 시 모든 위젯의 활성화 상태 확인
    static async getSettings(dogId) {
        const [widgets] = await db.query(`
            SELECT widget_type, is_activated 
            FROM widgets 
            WHERE dog_id = ?
        `, [dogId]);

        const allTypes = ['식사', '산책', '간식', '목욕', '병원', '기타'];
        const result = {};

        allTypes.forEach(type => {
            const widget = widgets.find(w => w.widget_type === type);
            result[type] = widget ? widget.is_activated : false;
        });

        return result;
        //반환 형태: { '식사': true, '산책': false, ... }
    }

    // 강아지의 활성화된 위젯 정보만 가져오기 
    static async getActiveWidgets(dogId) {
        const [widgets] = await db.query(`
            SELECT 
                w.widget_type,
                COUNT(si.instance_id) as today_count,
                COUNT(CASE WHEN si.is_completed = true THEN 1 END) as completed_count
            FROM widgets w
            LEFT JOIN schedules s ON w.dog_id = s.dog_id AND w.widget_type = s.schedule_type
            LEFT JOIN schedule_instances si ON s.schedule_id = si.schedule_id 
                AND DATE(si.scheduled_date) = CURRENT_DATE()
                AND si.is_deleted = false
            WHERE w.dog_id = ? AND w.is_activated = true
            GROUP BY w.widget_type
        `, [dogId]);
        return widgets;
        //반환 형태: [{ widget_type: '산책', today_count: 3, completed_count: 1 }, ...]
    }

    // 위젯 활성화/비활성화 설정
    static async updateWidget(dogId, widgetType, isActivated) {
        const [result] = await db.query(`
            INSERT INTO widgets (dog_id, widget_type, is_activated)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE is_activated = ?
        `, [dogId, widgetType, isActivated, isActivated]);
        return result;
    }
}

module.exports = Widget;