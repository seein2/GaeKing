const express = require('express');
const { join, login, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/join', join);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;