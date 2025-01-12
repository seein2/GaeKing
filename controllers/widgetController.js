// controllers/widget.controller.js
const Widget = require('../models/widgetModel');

exports.getSettings = async (req, res, next) => {
    try {
        const { dogId } = req.params;
        const settings = await Widget.getSettings(dogId);

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

exports.getActiveWidgets = async (req, res, next) => {
    try {
        const { dogId } = req.params;
        const widgets = await Widget.getActiveWidgets(dogId);

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

exports.updateWidget = async (req, res, next) => {
    try {
        const { dogId } = req.params;
        const { widgetType, isActivated } = req.body;

        if (!widgetType || isActivated === undefined) {
            return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
        }

        await Widget.updateWidget(dogId, widgetType, isActivated);
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