import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getPosts } from '../src/api/posts.ts'

test('게시물 조회 요청과 응답 및 실패 처리', async (t) => {
  const posts = [{ id: '1', content: '첫 줄\n둘째 줄' }]
  const controller = new AbortController()
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'http://localhost:8080/posts')
    assert.equal(options.signal, controller.signal)
    return Response.json(posts)
  })
  assert.deepEqual(
    await getPosts('http://localhost:8080/', controller.signal),
    posts,
  )

  fetchMock.mock.mockImplementation(async (url) => {
    assert.equal(url, '/posts')
    return Response.json([])
  })
  assert.deepEqual(await getPosts(''), [])

  fetchMock.mock.mockImplementation(
    async () => new Response(null, { status: 500 }),
  )
  await assert.rejects(getPosts(''), /500/)

  for (const data of [
    { items: posts },
    [null],
    [{ id: 1, content: '본문' }],
    [{ id: '1' }],
  ]) {
    fetchMock.mock.mockImplementation(async () => Response.json(data))
    await assert.rejects(getPosts(''), /응답 형식/)
  }

  fetchMock.mock.mockImplementation(async () => new Response('<html>'))
  await assert.rejects(getPosts(''), SyntaxError)

  fetchMock.mock.mockImplementation(async () => {
    throw new TypeError('Failed to fetch')
  })
  await assert.rejects(getPosts(''), /Failed to fetch/)

  fetchMock.mock.mockImplementation(async (_url, { signal }) => {
    signal.throwIfAborted()
  })
  controller.abort()
  await assert.rejects(getPosts('', controller.signal), { name: 'AbortError' })
})
