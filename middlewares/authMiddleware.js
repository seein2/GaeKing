const Token = require('../models/tokenModel');
const User = require('../models/userModel');

exports.authMiddleware = async (req, res, next) => {
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
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: '유효한 토큰 형식이 아닙니다.'
            });
        }

        try {
            // 토큰 검증
            const decoded = Token.verifyAccessToken(accessToken);
            if (!decoded || !decoded.user_id) {
                console.log('토큰 검증 실패:', {decoded});
                return res.status(401).json({
                    success: false,
                    message: '토큰이 유효하지 않습니다.'
                });
            }

            // 사용자가 존재하는지 확인
            const user = await User.findById(decoded.user_id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '존재하지 않는 사용자입니다.'
                });
            }

            // req 객체에 user 추가
            req.user = {
                user_id: user.user_id,
                user_name: user.user_name
            };

            next();
        } catch (tokenError) {
            // 토큰 검증 과정에서의 구체적인 에러 처리
            return res.status(401).json({
                success: false,
                message: '토큰 검증 실패',
                error: tokenError.message
            });
        }
    } catch (error) {
        console.error('인증 미들웨어 에러:', error);
        return res.status(500).json({
            success: false,
            message: '서버 내부 오류'
        });
    }
};