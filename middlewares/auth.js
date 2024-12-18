const Token = require('../models/tokenModel');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    try {
        // Authorization 헤더에서 토큰 추출
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.'
            });
        }

        // 'Bearer ' 부분을 제외한 실제 토큰 추출
        const accessToken = authHeader.split(' ')[1];

        // 토큰 검증
        const decoded = Token.verifyAccessToken(accessToken);
        // 사용자가 존재하는지 확인
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '존재하지 않는 사용자입니다.'
            });
        }

        // req 객체에 user 추가
        req.user = {
            id: user.id,
            user_name: user.user_name
        };

        next();
    } catch (error) {
        // 토큰이 만료되었거나 유효하지 않은 경우
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.'
        });
    }
};

module.exports = authMiddleware;