# Instagram Clone Client

React·TypeScript·Vite로 구현한 게시물 조회 화면입니다.

## 실행

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`의 `VITE_API_BASE_URL`을 백엔드 주소로 변경하세요. 기본 예시는 `http://localhost:8080`이며, 해당 서버의 `GET /posts`를 호출합니다. 환경 변수 변경 후 개발 서버를 재시작하세요.

변수를 설정하지 않으면 프론트엔드와 동일한 출처의 `/posts`를 호출합니다. 별도 출처의 백엔드는 프론트엔드 주소(기본 `http://localhost:5173`)에 대한 CORS 허용이 필요합니다. 실제 API 서버가 필요하며 목업 서버는 포함하지 않습니다.

응답 형식은 [게시물 조회 API 명세](docs/api.md)를 참고하세요. 화면은 게시물 목록, 로딩, 빈 목록, 오류 및 재시도를 지원합니다.

## 검증

```sh
pnpm build
pnpm lint
node --test tests/posts.test.mjs
```

테스트는 TypeScript를 직접 실행할 수 있는 Node.js 22.18 이상을 사용합니다.
