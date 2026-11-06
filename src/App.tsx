import { useEffect, useState } from 'react'
import { getPosts, type Post } from './api/posts'
import './App.css'

function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

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
