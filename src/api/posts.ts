export type Post = {
  id: string
  content: string
}

function isPost(post: unknown): post is Post {
  return (
    post !== null &&
    typeof post === 'object' &&
    'id' in post &&
    typeof post.id === 'string' &&
    'content' in post &&
    typeof post.content === 'string'
  )
}

export async function createPost(
  baseUrl: string,
  content: string,
): Promise<Post> {
  if (!content.trim()) throw new Error('본문을 입력해 주세요.')

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    const error: unknown = await response.json().catch(() => null)
    if (
      response.status === 400 &&
      error !== null &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.trim()
    ) {
      throw new Error(error.message)
    }
    throw new Error('게시물을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
  }

  const data: unknown = await response.json()
  if (!isPost(data)) throw new Error('게시물 응답 형식이 올바르지 않습니다.')
  return data
}

export async function getPosts(
  baseUrl: string,
  signal?: AbortSignal,
): Promise<Post[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/posts`, {
    signal,
  })
  if (!response.ok) throw new Error(`게시물 조회 실패: ${response.status}`)

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every(isPost)) {
    throw new Error('게시물 응답 형식이 올바르지 않습니다.')
  }

  return data
}
