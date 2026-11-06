# 게시물 API 명세

## 전체 게시물 조회

모든 게시물을 조회합니다. 정렬 순서는 보장하지 않습니다.

### 요청

```http
GET /posts
```

### 성공 응답

- 상태 코드: `200 OK`
- Content-Type: `application/json`
- 응답 본문: 모든 게시물을 담은 JSON 배열

각 게시물은 아래 두 필드만 포함합니다.

| 필드      | 타입   | 설명                 |
| --------- | ------ | -------------------- |
| `id`      | string | 게시물의 고유 식별자 |
| `content` | string | 게시물 본문          |

```json
[
  {
    "id": "1",
    "content": "첫 번째 게시물입니다."
  },
  {
    "id": "2",
    "content": "두 번째 게시물입니다."
  }
]
```

게시물이 없으면 `200 OK`와 빈 배열을 반환합니다.

```json
[]
```

## 게시물 생성

본문을 입력하여 게시물을 생성합니다. `id`는 서버에서 고유한 문자열로 생성합니다.

### 요청

```http
POST /posts
Content-Type: application/json
```

| 필드      | 타입   | 필수 여부 | 설명        |
| --------- | ------ | --------- | ----------- |
| `content` | string | 필수      | 게시물 본문 |

```json
{
  "content": "새로운 게시물입니다."
}
```

### 성공 응답

- 상태 코드: `201 Created`
- Content-Type: `application/json`
- 응답 본문: 생성된 게시물 객체. 조회 API와 동일하게 `id`, `content`만 포함합니다.

```json
{
  "id": "3",
  "content": "새로운 게시물입니다."
}
```

생성된 게시물은 이후 `GET /posts` 응답에 포함됩니다.

### 잘못된 요청

JSON 형식이 잘못되었거나, `content`가 누락되었거나 문자열이 아닌 경우 `400 Bad Request`를 반환합니다. 본문이 비어 있는 경우에도 동일한 상태 코드를 반환합니다.

- Content-Type: `application/json`
- 응답 본문: 오류 코드 `code`와 원인을 설명하는 `message` 문자열

```json
{
  "code": "INVALID_REQUEST",
  "message": "content는 공백이 아닌 문자열이어야 합니다."
}
```

`code`는 `INVALID_REQUEST`로 고정하며, `message`는 실패 원인에 따라 달라질 수 있습니다.
