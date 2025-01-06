const express = require('express');
const { register,list, info, update, remove,invitation, join_invitation } = require('../controllers/dogController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProfile } = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', uploadProfile.single('profile_image'), register);
router.get('/', list);
router.get('/:id', info);
router.put('/:id', uploadProfile.single('profile_image'),  update);
router.delete('/:id', remove);

//해당 강아지의 멤버 초대
router.post('/:id/invite', invitation);
router.post('/join', join_invitation);

module.exports = router;