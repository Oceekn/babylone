import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Menu, Search, Heart, MessageCircle, Send, Star, Loader, Plus } from 'lucide-react'
import { professionalsService, Professional } from '../../services/professionals.service'
import { api } from '../../services/api'
import './ClientHomeFeed.css'

interface Post {
  id: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  shares_count?: number
  created_at?: string
  user?: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface Story {
  id: string
  user_id: string
  text?: string
  media_url?: string
  views_count: number
  user?: { id: string; first_name?: string; last_name?: string; avatar_url?: string }
}

interface Promotion {
  id: string
  title: string
  discount: string
  image?: string
}

const ClientHomeFeed = () => {
  const navigate = useNavigate()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [promotions] = useState<Promotion[]>([
    { id: 'p1', title: 'Salon Amina', discount: '20% off', image: '🎁' },
    { id: 'p2', title: 'Fitness with Jean', discount: '15% off', image: '🎉' },
    { id: 'p3', title: 'Clean Home', discount: '10% off', image: '✨' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [prosData, postsData, storiesData] = await Promise.allSettled([
        professionalsService.getPopular(),
        api.get<Post[]>('/social/feed?limit=5'),
        api.get<Story[]>('/social/stories'),
      ])
      if (prosData.status === 'fulfilled') setProfessionals(prosData.value)
      if (postsData.status === 'fulfilled') setPosts(postsData.value as Post[])
      if (storiesData.status === 'fulfilled') setStories(Array.isArray(storiesData.value) ? storiesData.value : [])
    } catch (err) {
      console.error('Erreur feed:', err)
    } finally {
      setLoading(false)
    }
  }

  const getProfName = (p: Professional) => {
    if (p.user) return `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() || p.business_name || 'Pro'
    return p.business_name || 'Professionnel'
  }

  const getPostAuthor = (post: Post) => {
    if (post.user) return `${post.user.first_name || ''} ${post.user.last_name || ''}`.trim() || 'Utilisateur'
    return 'Utilisateur'
  }

  const getStoryName = (story: Story) => {
    if (story.user) return `${story.user.first_name || ''} ${story.user.last_name || ''}`.trim() || 'Utilisateur'
    return 'Utilisateur'
  }

  const formatPostDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Aujourd\'hui'
    if (diffDays === 1) return '1d'
    if (diffDays < 7) return `${diffDays}d`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks < 4) return `${diffWeeks}w`
    return `${Math.floor(diffDays / 30)}mo`
  }

  return (
    <ScreenLayout showBottomNav>
      <div className="client-home-feed">
        <header className="feed-header">
          <div className="header-icon" onClick={() => navigate('/profile')}>
            <Menu size={24} />
          </div>
          <h1 className="feed-title">Babylone</h1>
          <button className="header-search-btn" onClick={() => navigate('/services')}>
            <Search size={24} />
          </button>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : (
          <>
            {/* Stories Section */}
            <div className="stories-section">
              <div className="stories-scroll">
                <div className="story-item" onClick={() => navigate('/social/create-story')}>
                  <div className="story-avatar story-avatar-create">
                    <Plus size={24} color="#666" />
                  </div>
                  <span className="story-name">Créer</span>
                </div>
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="story-item"
                    onClick={() => navigate(`/social/story/${story.id}`)}
                  >
                    <div 
                      className="story-avatar"
                      style={story.user?.avatar_url ? { backgroundImage: `url(${story.user.avatar_url})` } : {}}
                    >
                      {!story.user?.avatar_url && (
                        <span>{getStoryName(story).charAt(0)}</span>
                      )}
                    </div>
                    <span className="story-name">{getStoryName(story)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Professionals */}
            {professionals.length > 0 && (
              <>
                <h3 className="section-title">Popular Professionals</h3>
                <div className="professionals-scroll">
                  <div className="professionals-container">
                    {professionals.map((prof) => (
                      <div
                        key={prof.id}
                        className="professional-card"
                        onClick={() => navigate(`/services/professional/${prof.id}`)}
                      >
                        <div className="prof-image">
                          {prof.user?.avatar_url ? (
                            <img src={prof.user.avatar_url} alt="" />
                          ) : (
                            <div className="prof-placeholder">{getProfName(prof).charAt(0)}</div>
                          )}
                        </div>
                        <p className="prof-name">{getProfName(prof)}</p>
                        <p className="prof-profession">{prof.profession || ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Promotions Section */}
            {promotions.length > 0 && (
              <>
                <h3 className="section-title">Promotions</h3>
                <div className="promotions-scroll">
                  <div className="promotions-container">
                    {promotions.map((promo) => (
                      <div key={promo.id} className="promotion-card">
                        <div className="promo-image" style={{ fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {promo.image || '🎁'}
                        </div>
                        <p className="promo-name">{promo.title}</p>
                        <p className="promo-discount">{promo.discount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Feed Posts */}
            <div className="feed-posts">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-container">
                      {post.image_url && (
                        <div className="post-image">
                          <img src={post.image_url} alt="" />
                        </div>
                      )}
                      <div className="post-content">
                        <p className="post-author-name">{getPostAuthor(post)}</p>
                        <div className="post-text-wrapper">
                          <p className="post-text">{post.content}</p>
                          <p className="post-date">{formatPostDate(post.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="post-engagement">
                      <button className="engagement-btn">
                        <Heart size={24} />
                        <span>{post.likes_count || 0}</span>
                      </button>
                      <button className="engagement-btn">
                        <MessageCircle size={24} />
                        <span>{post.comments_count || 0}</span>
                      </button>
                      <button className="engagement-btn">
                        <Send size={24} />
                        <span>{post.shares_count || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                  <p>Pas de publications pour le moment</p>
                  <button
                    onClick={() => navigate('/social')}
                    style={{ marginTop: '8px', background: 'none', border: 'none', color: '#a14545', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  >
                    Decouvrir le reseau social
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default ClientHomeFeed
