const express = require('express');
const { register, info } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProfile } = require('../middlewares/uploadMiddleware')
const router = express.Router();

router.use(authMiddleware);

router.post('/register',uploadProfile.single('profile_image'), register);
router.get('/info', info);

module.exports = router;