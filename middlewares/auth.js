const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 토큰이 있는지 확인
    if (!token) {
        return res.status(401).json({ error: 'Access Token이 없습니다.' });
    }

    // Bearer 스키마 확인 
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '잘못된 토큰 형식입니다.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // 구체적인 에러 처리
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: '만료된 토큰입니다.' });
            }
            return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }

        req.user = user;
        next();
    });
};