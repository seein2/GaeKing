const express = require('express');
const { register, info, update, remove } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProfile } = require('../middlewares/uploadMiddleware')
const router = express.Router();

router.use(authMiddleware);

router.post('/', uploadProfile.single('profile_image'), register);
router.get('/:id', info);
router.put('/:id', uploadProfile.single('profile_image'),  update);
router.delete('/:id', remove);

module.exports = router;