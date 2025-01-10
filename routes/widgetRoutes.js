const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();
const { getSettings, getActiveWidgets, updateWidget } = require('../controllers/widgetController');

router.use(authMiddleware);

// 위젯 설정 상태 조회
router.get('/settings/:dogId', getSettings);

// 활성화된 위젯 정보 조회
router.get('/active/:dogId', getActiveWidgets);

// 위젯 활성화/비활성화 업데이트
router.put('/:dogId', updateWidget);

module.exports = router;