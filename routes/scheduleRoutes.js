const express = require('express');
const { create, getScheduleList, getScheduleDetail, updateSchedule, removeSchedule } = require('../controllers/scheduleController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', create);
router.put('/:schedule_id', updateSchedule);
router.delete('/:schedule_id', removeSchedule);
router.get('/list/:date', getScheduleList);
router.get('/:schedule_id', getScheduleDetail);

module.exports = router;