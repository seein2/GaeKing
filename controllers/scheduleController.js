const Schedule = require('../models/scheduleModel');

exports.register = async (req, res) => {
    try {
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