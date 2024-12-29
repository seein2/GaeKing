const Dog = require('../models/dogModel');
const db = require('../config/db');

exports.register = async (req, res) => {
    const connection = await db.getConnection(); // 트랜잭션을 사용하기 위한 커넥션 가져오기

    console.log(req.body);
    const { dog_name, birth_date, breed_type, gender } = req.body;
    const profile_image = req.file ? req.file.path : null;
    const user_id = req.user.user_id; // 인증 미들웨어에서 설정된 사용자 정보
    try {
        await connection.beginTransaction(); // 트랜잭션 시작
        const dogId = await Dog.createDog(dog_name, birth_date, breed_type, gender, profile_image, user_id, connection);
        await connection.commit(); // 성공하면 커밋

        const result = await Dog.findById(dogId);

        return res.status(201).json({
            success: true,
            message: '강아지가 등록되었습니다.',
            result,
        });
    } catch (error) {
        await connection.rollback(); // 데베 작업 실패하면 트랜잭션 롤백
        res.status(500).json({
            success: false,
            message: '강아지 등록 중 오류 발생',
        });
    } finally {
        connection.release();
    }
};

exports.info = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Dog.findById(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '강아지를 찾을 수 없습니다.',
            });
        }

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

exports.update = async(req, res) => {
    const { id } = req.params
    const { dog_name, birth_date, breed_type, gender, profile_image} = req.body;
    const connection = await db.getConnection();  

    try {
        await connection.beginTransaction();
        
        // 강아지 존재 여부 확인
        const result = await Dog.findById(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '강아지를 찾을 수 없습니다.',
            });
        }

        // 수정 권한 확인 (현재 로그인한 사용자의 강아지인지)
        if (dog_user.user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: '수정 권한이 없습니다.',
            });
        }

        // 강아지 정보 업데이트
        // updateDog 수정
        await Dog.updateDog(id, { 
            dog_name, 
            birth_date, 
            breed_type, 
            gender, 
            profile_image 
        });
        
        await connection.commit();

        const updatedDog = await Dog.findById(id);
        
        return res.status(200).json({
            success: true,
            message: '강아지 정보가 수정되었습니다.',
            result: updatedDog,
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: '강아지 정보 수정 중 오류 발생',
        });
    } finally {
        connection.release();
    }
};

exports.remove = async(req, res) => {
    const{id}=req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        //강아지 존재 여부 확인
        const dog = await Dog.findById(id);
        if(!dog) {
            return res.status(404).json({
                success : false,
                message : '강아지를 찾을 수 없습니다.',
            });
        }

        //삭제 권한 확인 (현재 로그인한 사용자의 강아지인지)
        if (dog_user.user_id != req.user.user_id) {
            return res.status(403).json({
                success:false,
                message:'삭제 권한이 없습니다. ',
            });
        }

        await Dog.deleteDog(id, connection);

        await connection.commit();
        return res.status(200).json({
            success: true,
            message: '강아지가 삭제되었습니다.',
        });

    }catch(error) {
        await connection.rollback();
        res.status(500).json({
            success:false,
            message: '강아지 삭제 중 오류 발생',
        });
    }finally {
        connection.release();
    }
}; 
