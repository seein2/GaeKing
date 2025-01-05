const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { create, getScheduleList, getScheduleDetail, update, delete : deleteSchedule } = require('../controllers/scheduleController');
const router = express.Router();

router.use(authMiddleware);

router.post('/', create);
router.put('/:schedule_id', update);
router.delete('/:schedule_id', deleteSchedule);
router.get('/list/:date', getScheduleList);
router.get('/detail/:schedule_id', getScheduleDetail);

module.exports = router;