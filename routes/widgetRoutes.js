const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getSettings, getActiveWidgets, updateWidget } = require('../controllers/widgetController');
const router = express.Router();

router.use(authMiddleware);

// 위젯 설정 상태 조회
router.get('/settings/:dog_id', getSettings);
// 활성화된 위젯 정보 조회
router.get('/active/:dog_id', getActiveWidgets);
// 위젯 활성화/비활성화 업데이트
router.post('/:dog_id', updateWidget);

module.exports = router;