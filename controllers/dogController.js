const Dog = require('../models/dogModel');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { dog_name, birth_date, breed_type, gender, profile_image } = req.body;
    const user_id = req.user.id; // 인증 미들웨어에서 설정된 사용자 정보
    try {
        const result = await Dog.createDog(dog_name, birth_date, breed_type, gender, profile_image, user_id);

        return res.status(201).json({
            success: true,
            message: '강아지가 등록되었습니다.',
            result,
        });
    } catch (error) {
        await db.rollback(); // 데베 작업 실패하면 트랜잭션 롤백
        res.status(500).json({
            success: false,
            message: '강아지 등록 중 오류 발생',
        });
    }
};

exports.info = async (req, res) => {
    const { id } = req.params;
    try {
        const dog = await this.findById(id);
        if (!dog) {
            return res.status(404).json({
                success: false,
                message: '강아지를 찾을 수 없습니다.',
            });
        }
        const result = await Dog.findById(id);

        return res.status(200).json({
            success: true,
            message: '강아지 정보 조회',
            result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '강아지 조회 중 오류 발생',
        })
    }
};