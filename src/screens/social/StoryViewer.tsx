import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Eye, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import { api } from '../../services/api'
import './StoryViewer.css'

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

const StoryViewer = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [stories, setStories] = useState<Story[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStories() }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await api.get<Story[]>('/social/stories')
      const storiesArray = Array.isArray(data) ? data : []
      setStories(storiesArray)

      // Trouver l'index de la story demandee
      if (id) {
        const idx = storiesArray.findIndex((s: Story) => s.id === id)
        if (idx >= 0) setCurrentIndex(idx)
        // Marquer comme vue
        try { await api.get(`/social/stories/${id}`) } catch {}
      }
    } catch (err) {
      console.error('Erreur stories:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentStory = stories[currentIndex]

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      // Marquer comme vue
      try { api.get(`/social/stories/${stories[currentIndex + 1].id}`) } catch {}
    } else {
      navigate(-1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const getAuthor = (story: Story) => {
    if (story.user) return `${story.user.first_name || ''} ${story.user.last_name || ''}`.trim()
    return 'Utilisateur'
  }

  const getTimeAgo = (date: string) => {
    const ms = Date.now() - new Date(date).getTime()
    const hours = Math.floor(ms / (1000 * 60 * 60))
    if (hours < 1) return 'maintenant'
    return `il y a ${hours}h`
  }

  if (loading) {
    return (
      <ScreenLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (!currentStory) {
    return (
      <ScreenLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
          <p>Aucune story disponible</p>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Retour</button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <div className="story-viewer">
        <div className="story-progress">
          {stories.map((_, i) => (
            <div key={i} className={`progress-bar ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''}`} />
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
            <div>
              <span className="author-name">{getAuthor(currentStory)}</span>
              <span className="story-time">{getTimeAgo(currentStory.created_at)}</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => navigate(-1)}><X size={24} /></button>
        </div>

        <div className="story-content" onClick={goNext}>
          {currentStory.media_url ? (
            <img src={currentStory.media_url} alt="" className="story-media" />
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

        <div className="story-navigation">
          {currentIndex > 0 && (
            <button className="nav-btn left" onClick={goPrev}><ChevronLeft size={24} /></button>
          )}
          {currentIndex < stories.length - 1 && (
            <button className="nav-btn right" onClick={goNext}><ChevronRight size={24} /></button>
          )}
        </div>

        <div className="story-footer">
          <div className="story-views">
            <Eye size={16} />
            <span>{currentStory.views_count}</span>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default StoryViewer
