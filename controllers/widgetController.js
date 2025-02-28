// controllers/widget.controller.js
const Widget = require('../models/widgetModel');

exports.getSettings = async (req, res) => {
    try {
        const { dog_id } = req.params;
        const settings = await Widget.getSettings(dog_id);

        return res.status(201).json({
            success: true,
            message: '위젯설정 상태 조회 성공',
            result: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '위젯설정 상태 조회 실패',
        });
    }
};

exports.getActiveWidgets = async (req, res) => {
    try {
        const { dog_id } = req.params;
        const widgets = await Widget.getActiveWidgets(dog_id);

        return res.status(201).json({
            success: true,
            message: '활성화된 위젯 조회 성공',
            result: widgets,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '활성화된 위젯 조회 실패',
        });
    }
};

exports.updateWidget = async (req, res) => {
    try {
        const { dog_id } = req.params;
        const { widget_types } = req.body;  // { '식사': true, '산책': true, ... }

        // 각 위젯 타입에 대해 업데이트 수행
        for (const [widgetType, isActivated] of Object.entries(widget_types)) {
            await Widget.updateWidget(dog_id, widgetType, isActivated);
        }

        return res.status(201).json({
            success: true,
            message: '위젯 업데이트 성공',
            result: true,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '위젯 업데이트 실패',
        });
    }
};