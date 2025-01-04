const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {create, completedButton, getByDogAndDate} = require('../controllers/scheduleController');
const router = express.Router();

router.use(authMiddleware);

router.post('/', create);
router.patch('/:schedule_id', completedButton);
router.get('/:dog_id/:date', getByDogAndDate);

module.exports = router;