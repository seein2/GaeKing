# 🐕 반려견 일정 관리 애플리케이션

반려견의 일정 및 정보를 관리할 수 있는 애플리케이션의 백엔드 API입니다. 사용자는 반려견을 등록하고, 산책, 식사 등의 일정을 관리하며, 위젯을 통해 일정 정보를 확인할 수 있습니다.

## ✨ 주요 기능

### 🔐 사용자 인증
- 회원가입 및 로그인
- JWT 기반 인증 (액세스 토큰 및 리프레시 토큰)
- 사용자 정보 조회

### 🐶 반려견 관리
- 반려견 등록, 조회, 수정, 삭제
- 여러 마리의 반려견 프로필 관리
- 반려견 프로필 사진 업로드
- 다른 사용자에게 반려견 관리 권한 초대

### 📅 일정 관리
- 다양한 유형의 일정 등록 (산책, 식사, 간식, 병원 등)
- 일정 목록 조회 및 상세 정보 확인
- 일정 수정 및 삭제
- 반복 일정 설정
- 일정 완료 표시
- 일정 알림 설정

### 🧩 위젯 관리
- 사용자 맞춤형 위젯 활성화/비활성화
- 활성화된 위젯 목록 조회
- 위젯 설정 상태 관리

## 🛠️ 기술 스택

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **인증**: JWT (JSON Web Tokens)
- **파일 업로드**: Multer

## 📚 API 엔드포인트

### 인증 API

| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST   | /auth/join | 회원가입 |
| POST   | /auth/login | 로그인 |
| POST   | /auth/logout | 로그아웃 |
| POST   | /auth/refresh | 액세스 토큰 갱신 |
| GET    | /auth/info | 사용자 정보 조회 |

### 반려견 API

| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST   | /dogs | 반려견 등록 |
| GET    | /dogs | 사용자의 반려견 목록 조회 |
| GET    | /dogs/:id | 특정 반려견 정보 조회 |
| PUT    | /dogs/:id | 반려견 정보 수정 |
| DELETE | /dogs/:id | 반려견 삭제 |
| GET    | /dogs/:dog_id/widgets | 반려견의 활성화된 위젯 목록 조회 |
| POST   | /dogs/widget/toggle | 위젯 활성화/비활성화 |
| POST   | /dogs/:id/invitation | 반려견 관리 초대 코드 생성 |
| POST   | /dogs/invitation/:code | 초대 코드로 반려견 관리 참여 |

### 위젯 API

| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET    | /widgets/:dog_id/settings | 위젯 설정 상태 조회 |
| GET    | /widgets/:dog_id/active | 활성화된 위젯 조회 |
| PUT    | /widgets/:dog_id | 위젯 업데이트 |

### 일정 API

| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST   | /schedules | 일정 등록 |
| GET    | /schedules/:date | 특정 날짜의 일정 목록 조회 |
| GET    | /schedules/detail/:schedule_id | 특정 일정 상세 조회 |
| PUT    | /schedules/:schedule_id | 일정 수정 |
| DELETE | /schedules/:schedule_id | 일정 삭제 |
| PUT    | /schedules/completion/:instance_id | 일정 완료 상태 변경 |

## 🚀 설치 및 실행 방법

### 필수 조건
- Node.js
- npm 또는 yarn
- MySQL

### 설치
1. 레포지토리 클론
```bash
git clone https://github.com/seein2/GaeKing.git
cd GaeKing
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수를 설정합니다:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_dbname
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
```

4. 데이터베이스 설정
```bash
npm run setup-db
```

5. 서버 실행
```bash
npm start
```

## 📝 사용 예시

### 회원가입
```javascript
fetch('http://localhost:3000/auth/join', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'example@email.com',
    password: 'securepassword',
    user_name: '홍길동'
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### 반려견 등록
```javascript
fetch('http://localhost:3000/dogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  },
  body: JSON.stringify({
    dog_name: '멍멍이',
    birth_date: '2020-01-01',
    breed_type: '골든 리트리버',
    gender: 'male'
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### 일정 등록
```javascript
fetch('http://localhost:3000/schedules', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  },
  body: JSON.stringify({
    dog_id: 1,
    type: '산책',
    date: '2023-05-01T14:00:00',
    description: '한강공원 산책',
    repeat: 'daily',
    times: 1,
    notification: true
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```


## 👥 기여하기

1. 이 레포지토리를 포크합니다.
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.
