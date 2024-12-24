const express = require('express');
const { register, info } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.post('/register', register);
router.get('/info', info);

module.exports = router;