# SSA TEST #

# 1. 초기 파일 생성

# 2. 서버 사이드 렌더링용 엔트리 작성 src/index.server.js

# 3. 서버 사이드 렌더링 전용 웹팩 환경 설정
- config/path.js
- config/webpack.config.server.js

# 4. 빌드 스크립트 작성
- scripts/build.server.js
- package.json script 추가

# 5. Express 웹 프레임워크 사용하여 웹 서버 코드 작성
- express 설치
- index.server.js

# 6. 정적 파일 접근
- Express static 미들웨어 사용
- build 의 js, css 정적 파일 접근

# 7. 데이터 로딩 : redux-thunk 사용
- redux, react-redux, redux-thunk, axios 설치
- PreloadContext 생성 
- 서버에서 리덕스 설정 및 PreloadContect 사용

# 8. 데이터 로딩 : redux-saga 사용
- redux-saga 설치
- 서버 사이드 렌더링 작업