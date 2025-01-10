// controllers/widget.controller.js
const Widget = require('../models/widgetModel');

exports.getSettings = async (req, res, next) => {
    try {
        const { dogId } = req.params;
        const settings = await Widget.getSettings(dogId);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

exports.getActiveWidgets = async (req, res, next) => {
    try {
        const { dogId } = req.params;
        const widgets = await Widget.getActiveWidgets(dogId);
        res.json(widgets);
    } catch (error) {
        next(error);
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
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};