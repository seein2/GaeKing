const db = require('../config/db');
const jwt = require('jsonwebtoken');

class Token {
    // 리프레시토큰 저장
    static async saveToken(userId, token, expires_at) {
        const [result] = await db.query(
            `INSERT INTO refresh_tokens(user_id, token, expires_at)
                VALUES (?, ?, ?)`,
            [userId, token, expires_at]
        );
        return result.insertId;
    }

    // db에서 만료되지 않은 리프레시토큰찾기
    static async findToken(token) {
        const [result] = await db.query(
            `SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`,
            [token]
        );
        return result[0];
    }

    // 토큰 삭제
    static async deleteToken(token) {
        const [result] = await db.query(
            `DELETE FROM refresh_tokens WHERE token = ?`,
            [token]
        );
        return result.insertId;
    }


    // 엑세스토큰 생성
    static createAccessToken(user) {
        return jwt.sign(
            { userId: user.id },
            process.env.ACCESS_SECRET,
            { expiresIn: '15m' } // 만료시간 15분
        );
    }

    // 리프레시토큰 생성
    static async createRefreshToken(user) {
        // 리프레시토큰을 만들기 전에 기존의 리프레시토큰 삭제
        await db.query(
            `DELETE FROM refresh_tokens WHERE user_id = ?`,
            [user.id]
        );
        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.REFRESH_SECRET,
            { expiresIn: '30d' }, // 만료시간 30일
        );

        // 만료시간 계산
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 30);
        // db에 저장
        await this.saveToken(user.id, refreshToken, expires_at);
        return refreshToken;
    }

    // 엑세스토큰검증
    static verifyAccessToken(token) {
        return jwt.verify(token, process.env.ACCESS_SECRET);
    }

    // 리프레시토큰검증
    static async verifyRefreshToken(token) {
        const isToken = await this.findToken(token);
        if (!isToken) {
            throw new Error('유효하지 않은 토큰');
        }
        return jwt.verify(token, process.env.REFRESH_SECRET);
    }

    // 리프레시토큰으로 엑세스토큰 발급
    static async refreshAccessToken(refreshToken) {
        const newToken = await this.verifyRefreshToken(refreshToken);
        if (!newToken) {
            throw new Error('토큰 발급 실패');
        }
        return this.createAccessToken({ id: newToken.userId })
    }
};

module.exports = Token;