import { useEffect, useState } from 'react'

const TOKEN_KEY = 'mate-auth-token'

function getAuthorName(post) {
  return post?.author?.username || post?.author?.name || 'Mate member'
}

function formatPostDate(post) {
  const dateValue = post?.createdAt || post?.updatedAt
  if (!dateValue) return 'Just now'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [authMode, setAuthMode] = useState('signin')
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [draft, setDraft] = useState('')
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const requestOptions = (authToken = token) => ({
    headers: {
      Authorization: `Bearer ${authToken.trim()}`,
      'Content-Type': 'application/json'
    }
  })

  const loadPosts = async (authToken = token) => {
    if (!authToken.trim()) {
      setStatus({ type: 'notice', message: 'Add your token to view the community feed.' })
      return
    }

    setIsLoading(true)
    setStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/post', requestOptions(authToken))
      const data = await response.json()
      if (!response.ok) throw new Error(data.msg || 'Unable to load posts.')
      setPosts(Array.isArray(data.msg) ? data.msg : [])
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not reach the server.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadPosts()
  }, [])

  const authenticate = async (event) => {
    event.preventDefault()
    if (!credentials.username.trim() || !credentials.password) {
      setStatus({ type: 'error', message: 'Enter your username and password to continue.' })
      return
    }

    setIsAuthenticating(true)
    setStatus({ type: '', message: '' })
    try {
      const response = await fetch(`/api/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      if (!response.ok || !data.token) throw new Error(data.msg || 'Authentication failed.')
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setStatus({ type: 'success', message: authMode === 'signup' ? 'Your Mate account is ready.' : 'Welcome back. Your feed is ready.' })
      await loadPosts(data.token)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not reach the server.' })
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setPosts([])
    setStatus({ type: 'notice', message: 'You have been signed out.' })
  }

  const publishPost = async (event) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    if (!token.trim()) {
      setStatus({ type: 'error', message: 'Add your token before sharing a post.' })
      return
    }

    setIsPublishing(true)
    setStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/create-post', {
        ...requestOptions(),
        method: 'POST',
        body: JSON.stringify({ content })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.msg || 'Unable to publish post.')
      setDraft('')
      setStatus({ type: 'success', message: 'Your thought is out in the world.' })
      await loadPosts()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not publish your post.' })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Mate home">
          <span className="brand-mark">m</span>
          <span>mate</span>
        </a>
        <div className="topbar-note"><span className="status-dot" />A quieter place to share</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">A little room for your thoughts</p>
          <h1>Say what’s<br /><em>on your mind.</em></h1>
          <p className="hero-description">Small updates, honest moments, and the people who make them feel worth sharing.</p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core">✦</div>
          <span className="orbit-label label-one">be present</span>
          <span className="orbit-label label-two">stay curious</span>
        </div>
      </section>

      <section className="workspace" aria-label="Mate posts">
        <div className="composer-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Create a post</p>
              <h2>Leave a little note.</h2>
            </div>
            <span className="soft-number">01</span>
          </div>
          <form className="composer" onSubmit={publishPost}>
            <label htmlFor="post-content">What would you like to share?</label>
            <textarea
              id="post-content"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Something on your mind..."
              maxLength={500}
              rows={6}
            />
            <div className="composer-footer">
              <span className="character-count">{draft.length} / 500</span>
              <button className="primary-button" disabled={isPublishing || !draft.trim()} type="submit">
                {isPublishing ? 'Sharing...' : 'Share post'} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>

          <div className="auth-panel">
            <div className="auth-header">
              <div>
                <p className="eyebrow">Your space</p>
                <h3>{token ? 'You are connected.' : 'Join the conversation.'}</h3>
              </div>
              {token && <button className="signout-button" type="button" onClick={signOut}>Sign out</button>}
            </div>
            {!token && (
              <>
                <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
                  <button className={authMode === 'signin' ? 'active' : ''} type="button" onClick={() => setAuthMode('signin')}>Sign in</button>
                  <button className={authMode === 'signup' ? 'active' : ''} type="button" onClick={() => setAuthMode('signup')}>Create account</button>
                </div>
                <form onSubmit={authenticate}>
                  <div className="auth-fields">
                    <input aria-label="Username" autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} placeholder="Username" minLength={3} maxLength={20} />
                    <input aria-label="Password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="Password" minLength={8} maxLength={50} />
                  </div>
                  <button className="quiet-button auth-submit" disabled={isAuthenticating} type="submit">{isAuthenticating ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Sign in'} <span>↗</span></button>
                </form>
                <p className="auth-note">Your password is sent only to your Mate server. The session token is saved in this browser.</p>
              </>
            )}
          </div>
        </div>

        <div className="feed-column">
          <div className="section-heading feed-heading">
            <div>
              <p className="eyebrow">The community</p>
              <h2>All posts <span>{posts.length || ''}</span></h2>
            </div>
            <button className="refresh-button" onClick={loadPosts} disabled={isLoading} aria-label="Refresh posts" title="Refresh posts">↻</button>
          </div>

          {status.message && <div className={`status-message ${status.type}`} role="status">{status.message}</div>}
          <div className="post-list">
            {isLoading ? (
              <div className="empty-state"><span className="loader" />Gathering the latest thoughts...</div>
            ) : posts.length ? (
              posts.map((post, index) => (
                <article className="post-card" key={post._id || `${post.content}-${index}`}>
                  <div className="post-meta"><span className="avatar">{getAuthorName(post).charAt(0).toUpperCase()}</span><span>{getAuthorName(post)}</span><span className="meta-divider">•</span><time>{formatPostDate(post)}</time></div>
                  <p className="post-content">{post.content}</p>
                  <div className="post-footer"><span>shared with mate</span><span className="spark">✦</span></div>
                </article>
              ))
            ) : (
              <div className="empty-state empty-feed"><span className="empty-icon">✦</span><h3>No posts yet.</h3><p>Be the first to leave something here.</p></div>
            )}
          </div>
        </div>
      </section>
      <footer><span>mate</span><span>made for meaningful moments</span></footer>
    </main>
  )
}

export default App
