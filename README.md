# GaeKing

## Git Commit Convention

### 커밋 메시지 구조

```
<type>: <subject>

<body>
```

### Commit Type

- `Feat`: 새로운 기능 추가
- `Fix`: 버그 수정
- `Docs`: 문서 수정 (README.md)
- `Style`: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `Comment`: 필요한 주석 추가 및 변경
- `Refactor`: 코드 리팩토링
- `Chore`: 빌드 태스크 업데이트, 패키지 매니저 설정할 경우(package.json)
- `Rename`: 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
- `Remove`: 파일을 삭제하는 작업만 수행한 경우

### Subject
- 마침표 및 특수기호는 사용하지 않는다.
- 개조식 구문으로 작성한다.


### 예시

```
Feat: 회원가입 API 구현

- 회원가입 유효성 검사 추가
- JWT 토큰 발급 로직 구현
```

```
Fix: 로그인 시 토큰 만료 오류 수정

토큰 만료 시간 계산 로직 버그 수정
expires_at 필드 타입 TIMESTAMP로 변경
```