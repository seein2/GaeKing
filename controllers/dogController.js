const Dog = require('../models/dogModel');

exports.register = async (req, res) => {
    const { dog_name, birth_date, breed_type, gender, profile_image } = req.body;
    try {
        const result = await Dog.createDog(dog_name, birth_date, breed_type, gender, profile_image);

        return res.status(201).json({
            success: true,
            message: '강아지가 등록되었습니다.',
            result,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '강아지 등록 중 오류 발생',
        })
    }
};

exports.info = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Dog.findById(id);

        return res.status(200).json({
            success: true,
            message: '강아지 정보 조회',
            result,
        })
    } catch (error) {
        const errors = ['강아지를 찾을 수 없습니다.'];
        if (errors.includes(error.message)) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: '강아지 조회 중 오류 발생',
        })
    }
};