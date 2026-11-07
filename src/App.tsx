import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPost, getPosts, type Post } from './api/posts'
import './App.css'

function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const submitting = useRef(false)

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setSaveError('')
    setSaveSuccess(false)
    if (!content.trim()) {
      setSaveError('본문을 입력해 주세요.')
      return
    }
    submitting.current = true
    setSaving(true)
    try {
      await createPost(import.meta.env.VITE_API_BASE_URL ?? '', content)
      setContent('')
      setSaveSuccess(true)
      retry()
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : '게시물을 저장하지 못했습니다.',
      )
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    getPosts(import.meta.env.VITE_API_BASE_URL ?? '', controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setPosts(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  function retry() {
    setError(false)
    setLoading(true)
    setAttempt((value) => value + 1)
  }

  return (
    <>
      <header className="site-header">Instagram</header>
      <main className="feed">
        <h1>게시물</h1>
        <form className="post-form" onSubmit={submitPost} aria-busy={saving}>
          <label htmlFor="post-content">새 게시물</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              setSaveError('')
              setSaveSuccess(false)
            }}
            rows={4}
            required
            disabled={saving}
            aria-invalid={Boolean(saveError)}
            aria-describedby={saveError ? 'save-error' : undefined}
            placeholder="어떤 이야기를 나누고 싶나요?"
          />
          <button type="submit" disabled={saving}>
            {saving ? '게시 중…' : '게시하기'}
          </button>
          {saveError && (
            <p id="save-error" role="alert">
              {saveError}
            </p>
          )}
          {saveSuccess && <p role="status">게시물이 등록되었습니다.</p>}
        </form>
        {loading ? (
          <p role="status">게시물을 불러오는 중입니다.</p>
        ) : error ? (
          <div role="alert">
            <p>게시물을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <button type="button" onClick={retry}>
              다시 시도
            </button>
          </div>
        ) : posts.length === 0 ? (
          <p role="status">아직 게시물이 없습니다.</p>
        ) : (
          <ul className="posts">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="post">
                  <h2>게시물 #{post.id}</h2>
                  <p className="post-content">{post.content}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}

export default App
