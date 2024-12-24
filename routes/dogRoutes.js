const express = require('express');
const { register, info } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/register', register);
router.get('/info', info);

module.exports = router;