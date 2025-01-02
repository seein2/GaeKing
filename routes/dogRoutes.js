const express = require('express');
const { register,list, info, update, remove, getProfileDetail } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProfile } = require('../middlewares/uploadMiddleware')
const router = express.Router();

router.use(authMiddleware);

router.post('/', uploadProfile.single('profile_image'), register);
router.get('/', list);
router.get('/:id', getProfileDetail);
router.get('/:id/edit', info);
router.put('/:id/edit', uploadProfile.single('profile_image'),  update);
router.delete('/:id/edit', remove);

module.exports = router;