const multer = require('multer');

// 프로필 이미지용 저장소 설정
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/profile/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// 공통 파일 필터
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Erroș('이미지 파일만 업로드 가능합니다.'), false);
    }
};

// 각각의 용도별 미들웨어 생성
const uploadProfile = multer({ storage: profileStorage, fileFilter: imageFilter });

module.exports = {
    uploadProfile,
};