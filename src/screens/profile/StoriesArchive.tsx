import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Loader } from 'lucide-react'
import { api } from '../../services/api'
import { formatTimeAgo } from '../../utils/date'
import './StoriesArchive.css'

interface Story {
  id: string
  user_id: string
  media_url?: string
  text?: string
  views_count: number
  expires_at: string
  created_at: string
}

const StoriesArchive = () => {
  const navigate = useNavigate()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.get<Story[]>('/social/stories/me?archived=true')
      .then((data) => {
        if (!cancelled) setStories(Array.isArray(data) ? data : [])
      })
      .catch(() => { if (!cancelled) setStories([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const openStory = (index: number) => {
    const story = stories[index]
    if (!story) return
    navigate(`/social/story/${story.id}`, { state: { stories, startIndex: index } })
  }

  return (
    <ScreenLayout title="Stories archivées" showBack>
      <div className="stories-archive">
        {loading ? (
          <div className="stories-archive-loading">
            <Loader size={32} className="spin" />
          </div>
        ) : stories.length === 0 ? (
          <p className="stories-archive-empty">Aucune story archivée. Elles apparaissent ici 24h après publication.</p>
        ) : (
          <div className="stories-archive-grid">
            {stories.map((story, index) => (
              <button
                key={story.id}
                type="button"
                className="stories-archive-item"
                onClick={() => openStory(index)}
              >
                {story.media_url?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={story.media_url} muted playsInline />
                ) : story.media_url ? (
                  <img src={story.media_url} alt="" />
                ) : (
                  <div className="stories-archive-text-preview">{story.text?.slice(0, 80)}</div>
                )}
                <span className="stories-archive-time">{formatTimeAgo(story.created_at)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default StoriesArchive
