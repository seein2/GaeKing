const express = require('express');
const { register, info } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProfile } = require('../middlewares/uploadMiddleware')
const router = express.Router();

router.use(authMiddleware);

router.post('/',uploadProfile.single('profile_image'), register);
router.get('/:id', info);
// router.put('/:id', update);
// router.delete('/:id', delete);

module.exports = router;