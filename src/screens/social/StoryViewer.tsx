import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Eye, X, MessageCircle, Loader } from 'lucide-react'
import { api } from '../../services/api'
import { authService } from '../../services/auth.service'
import { formatTimeAgo } from '../../utils/date'
import './StoryViewer.css'

const STORY_PHOTO_DURATION_MS = 15000

interface Story {
  id: string
  user_id: string
  media_url?: string
  text?: string
  views_count: number
  expires_at: string
  created_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface StoryViewerUser {
  id: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface StoryViewRow {
  id: string
  viewed_at: string
  user: StoryViewerUser
}

function getViewedIds(): Set<string> {
  try {
    const raw = localStorage.getItem('story_viewed_ids')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function addViewedId(storyId: string) {
  const set = getViewedIds()
  set.add(storyId)
  localStorage.setItem('story_viewed_ids', JSON.stringify([...set]))
}

const StoryViewer = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const stateStories = (location.state as { stories?: Story[]; startIndex?: number } | null)?.stories
  const stateStartIndex = (location.state as { startIndex?: number } | null)?.startIndex

  const [stories, setStories] = useState<Story[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [showViewersModal, setShowViewersModal] = useState(false)
  const [viewers, setViewers] = useState<StoryViewRow[]>([])
  const [loadingViewers, setLoadingViewers] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadStories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Story[]>('/social/stories')
      const storiesArray = Array.isArray(data) ? data : []
      setStories(storiesArray)
      if (id) {
        const idx = storiesArray.findIndex((s: Story) => s.id === id)
        if (idx >= 0) setCurrentIndex(idx)
        try { await api.get(`/social/stories/${id}`); addViewedId(id) } catch {}
      }
    } catch (err) {
      console.error('Erreur stories:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (stateStories && stateStories.length > 0) {
      setStories(stateStories)
      const idx = id
        ? stateStories.findIndex((s) => s.id === id)
        : (typeof stateStartIndex === 'number' ? stateStartIndex : 0)
      setCurrentIndex(idx >= 0 ? idx : 0)
      setLoading(false)
    } else {
      loadStories()
    }
  }, [stateStories, id, stateStartIndex])

  const currentStory = stories[currentIndex]
  const isVideo = currentStory?.media_url?.match(/\.(mp4|webm|ogg)$/i) || false
  const currentUserId = authService.getUserFromToken()?.sub
  const isMyStory = !!currentStory && currentStory.user_id === currentUserId

  const markViewedAndNext = useCallback(() => {
    if (!currentStory) return
    addViewedId(currentStory.id)
    try { api.get(`/social/stories/${currentStory.id}`) } catch {}
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      navigate(-1)
    }
  }, [currentStory, currentIndex, stories.length, navigate])

  const runProgress = useCallback((durationMs: number) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    const start = Date.now()
    const tick = () => {
      if (paused) return
      const elapsed = Date.now() - start
      const p = Math.min(1, elapsed / durationMs)
      setProgress(p)
      if (p >= 1) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
        markViewedAndNext()
      }
    }
    progressIntervalRef.current = setInterval(tick, 50)
  }, [paused, markViewedAndNext])

  useEffect(() => {
    setProgress(0)
    if (!currentStory) return
    if (isVideo && videoRef.current) {
      const v = videoRef.current
      const onTimeUpdate = () => setProgress(v.duration ? v.currentTime / v.duration : 0)
      const onEnded = () => markViewedAndNext()
      v.addEventListener('timeupdate', onTimeUpdate)
      v.addEventListener('ended', onEnded)
      if (!paused) v.play().catch(() => {})
      return () => {
        v.removeEventListener('timeupdate', onTimeUpdate)
        v.removeEventListener('ended', onEnded)
      }
    }
    if (!paused) runProgress(STORY_PHOTO_DURATION_MS)
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [currentIndex, currentStory?.id, isVideo, paused, markViewedAndNext, runProgress])

  useEffect(() => {
    if (!videoRef.current || !isVideo) return
    if (paused) videoRef.current.pause()
    else videoRef.current.play().catch(() => {})
  }, [paused, isVideo])

  const goNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    markViewedAndNext()
  }

  const goPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width / 3) goPrev(e)
    else goNext(e)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    if (touchStartY - endY > 80) navigate(-1)
  }

  const getAuthor = (story: Story) => {
    if (story.user) return `${story.user.first_name || ''} ${story.user.last_name || ''}`.trim()
    return 'Utilisateur'
  }

  const getTimeAgo = (date: string) => {
    const ago = formatTimeAgo(date)
    if (ago === 'à l\'instant') return 'maintenant'
    return `il y a ${ago}`
  }

  const handleReply = () => {
    if (currentStory?.user?.id) navigate(`/messages/chat/${currentStory.user.id}`)
  }

  const openViewersModal = useCallback(async () => {
    if (!currentStory?.id || !isMyStory) return
    setShowViewersModal(true)
    setLoadingViewers(true)
    try {
      const list = await api.get<StoryViewRow[]>(`/social/stories/${currentStory.id}/viewers`)
      setViewers(Array.isArray(list) ? list : [])
    } catch {
      setViewers([])
    } finally {
      setLoadingViewers(false)
    }
  }, [currentStory?.id, isMyStory])

  const handleReaction = (emoji: string) => {
    if (!currentStory?.id) return
    api.post(`/social/stories/${currentStory.id}/reaction`, { emoji }).catch(() => {})
  }

  if (loading) {
    return (
      <ScreenLayout>
        <div className="story-viewer-loading">
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (!currentStory) {
    return (
      <ScreenLayout>
        <div className="story-viewer-empty">
          <p>Aucune story disponible</p>
          <button type="button" className="story-back-btn" onClick={() => navigate(-1)}>Retour</button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <div
        className="story-viewer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="story-progress">
          {stories.map((_, i) => (
            <div key={i} className="progress-bar-wrap">
              <div
                className={`progress-bar ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''}`}
                style={i === currentIndex ? { width: `${progress * 100}%` } : undefined}
              />
            </div>
          ))}
        </div>

        <div className="story-header-bar">
          <div className="story-author-info">
            <div className="author-avatar-small">
              {currentStory.user?.avatar_url ? (
                <img src={currentStory.user.avatar_url} alt="" />
              ) : (
                getAuthor(currentStory).charAt(0)
              )}
            </div>
            <div className="story-meta">
              <span className="author-name">{getAuthor(currentStory)}</span>
              <span className="story-time">{getTimeAgo(currentStory.created_at)}</span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={() => navigate(-1)} aria-label="Fermer">
            <X size={24} />
          </button>
        </div>

        <div
          className="story-tap-zone"
          onClick={handleTap}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
        >
          {currentStory.media_url ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={currentStory.media_url}
                className="story-media story-video"
                playsInline
                muted={false}
              />
            ) : (
              <img src={currentStory.media_url} alt="" className="story-media" />
            )
          ) : (
            <div className="story-text-content">
              <p>{currentStory.text}</p>
            </div>
          )}
          {currentStory.text && currentStory.media_url && (
            <div className="story-overlay-text">
              <p>{currentStory.text}</p>
            </div>
          )}
        </div>

        <div className="story-footer">
          <div className="story-reactions">
            {['❤️', '🔥', '😂'].map((emoji) => (
              <button key={emoji} type="button" className="story-reaction-btn" onClick={() => handleReaction(emoji)}>{emoji}</button>
            ))}
          </div>
          <div className="story-reply-row">
            <input type="text" className="story-reply-input" placeholder="Répondre en message privé..." readOnly onClick={handleReply} />
            <button type="button" className="story-reply-btn" onClick={handleReply} aria-label="Répondre">
              <MessageCircle size={22} />
            </button>
          </div>
          <div
            className={`story-views ${isMyStory ? 'story-views-clickable' : ''}`}
            role={isMyStory ? 'button' : undefined}
            onClick={isMyStory ? openViewersModal : undefined}
          >
            <Eye size={16} />
            <span>{currentStory.views_count} vues</span>
          </div>
        </div>
      </div>

      {showViewersModal && (
        <div className="story-viewers-overlay" onClick={() => setShowViewersModal(false)}>
          <div className="story-viewers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="story-viewers-header">
              <h3>Vues</h3>
              <button type="button" className="story-viewers-close" onClick={() => setShowViewersModal(false)} aria-label="Fermer">
                <X size={22} />
              </button>
            </div>
            {loadingViewers ? (
              <div className="story-viewers-loading"><Loader size={28} className="spin" /></div>
            ) : viewers.length === 0 ? (
              <p className="story-viewers-empty">Aucune vue pour l’instant</p>
            ) : (
              <ul className="story-viewers-list">
                {viewers.map((v) => (
                  <li key={v.id} className="story-viewer-row">
                    <div className="story-viewer-avatar">
                      {v.user?.avatar_url ? (
                        <img src={v.user.avatar_url} alt="" />
                      ) : (
                        <span>{[v.user?.first_name, v.user?.last_name].filter(Boolean).map((n) => n?.charAt(0)).join('') || '?'}</span>
                      )}
                    </div>
                    <div className="story-viewer-info">
                      <span className="story-viewer-name">
                        {[v.user?.first_name, v.user?.last_name].filter(Boolean).join(' ') || 'Utilisateur'}
                      </span>
                      <span className="story-viewer-time">{formatTimeAgo(v.viewed_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </ScreenLayout>
  )
}

export default StoryViewer
