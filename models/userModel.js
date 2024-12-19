const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    // 회원가입 (유저생성)
    static async createUser(user_id, password, user_name) {
        // 중복아이디 확인
        const existingId = await User.findById(user_id);
        if (existingId) { // 존재하는 아이디면
            throw new Error('이미 존재하는 아이디입니다.');
        }
        // 중복닉네임 확인
        const existingName = await User.findByName(user_name)
        if (existingName) {
            throw new Error('이미 존재하는 닉네임입니다.');
        }

        // 비밀번호 암호화
        const hash = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            `INSERT INTO users (user_id, password, user_name)
                VALUES (?, ?, ?)`,
            [user_id, hash, user_name]
        );
        return { user_id, user_name };

    }

    // id로 회원찾기
    static async findById(user_id) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE user_id = ?',
            [user_id]
        );
        return rows[0]
    }

    // 이름으로 회원찾기
    static async findByName(user_name) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE user_name = ?',
            [user_name]
        );
        return rows[0]

    }

    // 로그인
    static async login(user_id, password) {
        const user = await User.findById(user_id);
        if (!user) {
            throw new Error('존재하지 않는 아이디입니다.');
        }
        const validPW = await bcrypt.compare(password, user.password);
        if (!validPW) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        return { user_id: user.user_id, user_name: user.user_name };

    }
};

module.exports = User;