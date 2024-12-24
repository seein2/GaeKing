const express = require('express');
const { join, login, logout, refresh, info } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/join', join);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/info', authMiddleware, info);

module.exports = router;