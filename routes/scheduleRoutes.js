const express = require('express');
const { create, getScheduleList, getScheduleDetail, updateSchedule, removeSchedule, completionSchedule } = require('../controllers/scheduleController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', create);
router.put('/:schedule_id', updateSchedule);
router.delete('/:schedule_id', removeSchedule);
router.get('/list/:date', getScheduleList);
router.get('/:schedule_id', getScheduleDetail);

// 스케줄 상태 업데이트. (부분 수정은 patch 사용)
router.patch('/:schedule_id/:instance_id', completionSchedule);

module.exports = router;