import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPost, getPosts } from '../src/api/posts.ts'

test('게시물 생성 요청, 본문 보존 및 오류 처리', async (t) => {
  const content = '  첫 줄\n둘째 줄  '
  const post = { id: '2', content }
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'http://localhost:8080/posts')
    assert.equal(options.method, 'POST')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { content })
    return Response.json(post, { status: 201 })
  })
  assert.deepEqual(await createPost('http://localhost:8080/', content), post)

  for (const empty of ['', ' \n\t ']) {
    await assert.rejects(createPost('', empty), /본문을 입력/)
  }
  assert.equal(fetchMock.mock.callCount(), 1)

  const longContent = '가'.repeat(2001)
  fetchMock.mock.mockImplementation(async (url, options) => {
    assert.equal(url, '/posts')
    assert.deepEqual(JSON.parse(options.body), { content: longContent })
    return Response.json({ id: '3', content: longContent }, { status: 201 })
  })
  assert.equal((await createPost('', longContent)).content, longContent)

  fetchMock.mock.mockImplementation(async () =>
    Response.json(
      { code: 'INVALID_REQUEST', message: '본문을 확인해 주세요.' },
      { status: 400 },
    ),
  )
  await assert.rejects(createPost('', content), /본문을 확인/)

  for (const status of [400, 500]) {
    fetchMock.mock.mockImplementation(
      async () => new Response('error', { status }),
    )
    await assert.rejects(createPost('', content), /저장하지 못했습니다/)
  }
  for (const data of [null, [], { id: 2, content }, { id: '2' }]) {
    fetchMock.mock.mockImplementation(async () =>
      Response.json(data, { status: 201 }),
    )
    await assert.rejects(createPost('', content), /응답 형식/)
  }
  fetchMock.mock.mockImplementation(async () => {
    throw new TypeError('Failed to fetch')
  })
  await assert.rejects(createPost('', content), /Failed to fetch/)
})

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
