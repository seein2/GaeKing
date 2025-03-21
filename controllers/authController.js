const Token = require('../models/tokenModel');
const User = require('../models/userModel');

exports.join = async (req, res) => {
    const { user_id, password, user_name } = req.body;
    // 비밀번호 복잡도 검증 필요하면 추가
    try {
        const user = await User.createUser(user_id, password, user_name);
        const accessToken = Token.createAccessToken(user);
        const refreshToken = await Token.createRefreshToken(user);

        // 회원가입 성공.
        return res.status(200).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            accessToken,
            refreshToken,
            user,
        });

    } catch (error) {
        const errors = ['이미 존재하는 아이디입니다.', '이미 존재하는 닉네임입니다.'];
        if (errors.includes(error.message)) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: '회원가입 중 오류 발생'
        });
    }
};

exports.login = async (req, res) => {
    const { user_id, password } = req.body;
    try {
        const user = await User.login(user_id, password);
        const accessToken = Token.createAccessToken(user);
        const refreshToken = await Token.createRefreshToken(user);

        return res.status(200).json({
            success: true,
            message: '로그인 성공.',
            accessToken,
            refreshToken,
            user,
        });

    } catch (error) {
        const errors = ['존재하지 않는 아이디입니다.', '비밀번호가 일치하지 않습니다.'];
        if (errors.includes(error.message)) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: '로그인 중 오류 발생',
        });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body; // 클라이언트에서 리프레시토큰을 보냄
    try {
        await Token.deleteToken(refreshToken);
        return res.status(200).json({
            success: true,
            message: '로그아웃 성공',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '로그아웃 중 오류 발생',
        });
    }
};

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const accessToken = await Token.refreshAccessToken(refreshToken);
        return res.status(200).json({
            success: true,
            message: '토큰 발생 성공',
            accessToken,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '토큰 발행 중 오류 발생',
        });
    }
};

exports.info = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: '사용자 정보 확인',
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '사용자 정보 확인 중 오류 발생',
        });
    }
};