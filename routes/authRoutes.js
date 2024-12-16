const express = require('express');
const { join, login, logout, refresh } = require('../controllers/authController');
const router = express.Router();

router.post('/join', join);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

module.exports = router;