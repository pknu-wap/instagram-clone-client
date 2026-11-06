export type Post = {
  id: string
  content: string
}

export async function getPosts(baseUrl: string, signal?: AbortSignal): Promise<Post[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/posts`, { signal })
  if (!response.ok) throw new Error(`게시물 조회 실패: ${response.status}`)

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every((post) =>
    post !== null && typeof post === 'object' &&
    typeof post.id === 'string' && typeof post.content === 'string'
  )) {
    throw new Error('게시물 응답 형식이 올바르지 않습니다.')
  }

  return data
}
