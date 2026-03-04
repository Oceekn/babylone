import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Heart, MessageCircle, Share2, Camera, Search } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { socialService, Post } from '../../services/social.service'
import { api } from '../../services/api'
import { formatTimeAgo } from '../../utils/date'
import './SocialFeed.css'

interface Story {
  id: string
  user_id: string
  text?: string
  media_url?: string
  views_count: number
  created_at?: string
  user?: { id: string; first_name?: string; last_name?: string; avatar_url?: string }
}

interface SocialGroup {
  id: string
  name: string
  members: number
  description: string
  category: string
  joined: boolean
  cover_url?: string
}

const defaultGroups: SocialGroup[] = [
  { id: 'g1', name: 'Cercle des Amis', members: 123, description: 'Un groupe pour les amis pour partager des moments et planifier des activites.', category: 'Loisirs', joined: false },
  { id: 'g2', name: 'Entrepreneurs du Cameroun', members: 456, description: 'Un reseau pour les entrepreneurs camerounais pour se connecter et collaborer.', category: 'Professionnels', joined: true },
  { id: 'g3', name: 'Yaounde City Life', members: 789, description: 'Un groupe communautaire pour les residents de Yaounde.', category: 'Locaux', joined: false },
  { id: 'g4', name: 'Artistes Locaux', members: 234, description: 'Une communaute pour les artistes locaux.', category: 'Loisirs', joined: false },
  { id: 'g5', name: 'Fitness Douala', members: 567, description: 'Groupe de fitness pour les habitants de Douala.', category: 'Loisirs', joined: true },
]

const SocialFeed = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'pour-vous' | 'amis' | 'groupes'>('pour-vous')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [groups, setGroups] = useState<SocialGroup[]>(() => {
    const stored = localStorage.getItem('social_groups')
    return stored ? JSON.parse(stored) : defaultGroups
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  // Charger le feed et les stories depuis le backend
  useEffect(() => {
    if (activeTab === 'pour-vous' || activeTab === 'amis') {
      loadFeed(true)
      loadStories()
    }
  }, [activeTab])

  const loadStories = async () => {
    try {
      const data = await api.get<Story[]>('/social/stories')
      setStories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement stories:', err)
      setStories([])
    }
  }

  const loadFeed = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)
      const cursor = reset ? undefined : nextCursor
      const response = await socialService.getFeed({
        limit: 10,
        cursor,
        pays_code: 'CM',
      })
      const newPosts = response.posts || []
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id))
          const added = newPosts.filter((p) => !ids.has(p.id))
          return prev.concat(added)
        })
      }
      setNextCursor(response.nextCursor)
    } catch (err: unknown) {
      console.error('Erreur lors du chargement du feed:', err)
      setError('Erreur lors du chargement du feed')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await socialService.toggleLike(postId) as { liked: boolean; likes_count?: number; likesCount?: number }
      const count = response.likes_count ?? response.likesCount ?? 0
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, likes_count: count } : post
      ))
      const newLikedPosts = new Set(likedPosts)
      if (response.liked) newLikedPosts.add(postId)
      else newLikedPosts.delete(postId)
      setLikedPosts(newLikedPosts)
    } catch (err) {
      console.error('Erreur lors du like:', err)
    }
  }

  const formatTime = (dateString: string) => formatTimeAgo(dateString)

  const getUserName = (post: Post) => {
    if (post.user) {
      return `${post.user.first_name || ''} ${post.user.last_name || ''}`.trim() || 'Utilisateur'
    }
    return 'Utilisateur'
  }

  const handleJoinGroup = (groupId: string) => {
    const updated = groups.map(g => g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g)
    setGroups(updated)
    localStorage.setItem('social_groups', JSON.stringify(updated))
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Un cercle = une personne : grouper par user (user.id en priorité pour éviter doublons)
  const storiesByUser = (() => {
    const map = new Map<string, { user: Story['user']; stories: Story[] }>()
    const sorted = [...stories]
      .filter((s) => (s.user?.id ?? s.user_id) != null && String(s.user?.id ?? s.user_id).trim() !== '')
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    for (const s of sorted) {
      const key = String(s.user?.id ?? s.user_id ?? '').trim().toLowerCase()
      const existing = map.get(key)
      if (existing) {
        existing.stories.push(s)
      } else {
        map.set(key, { user: s.user, stories: [s] })
      }
    }
    return Array.from(map.entries()).map(([user_id, { user, stories: userStories }]) => ({
      user_id,
      user,
      stories: userStories,
    }))
  })()

  return (
    <ScreenLayout
      title="Babylone"
      rightAction={
        <Search 
          size={24} 
          onClick={() => navigate('/social/search-users')}
          style={{ cursor: 'pointer' }}
        />
      }
      showBottomNav
    >
      <div className="social-feed">
        <div className="stories-section">
          <div className="stories-scroll">
            <div className="story-item" onClick={() => navigate('/social/create-story')}>
              <div className="story-avatar add-story">
                <span className="plus-icon">+</span>
              </div>
              <span className="story-name">Ma story</span>
            </div>
            {storiesByUser.map(({ user_id, user, stories: userStories }) => {
              const first = userStories[0]
              const storyName = user ? (user.first_name || 'Utilisateur') : 'Utilisateur'
              return (
                <div
                  key={user_id}
                  className="story-item"
                  onClick={() =>
                    navigate(`/social/story/${first.id}`, {
                      state: { stories: userStories, startIndex: 0 },
                    })
                  }
                >
                  <div className="story-avatar">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : first?.media_url ? (
                      <img src={first.media_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      storyName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="story-name">{storyName}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pour-vous' ? 'active' : ''}`}
            onClick={() => setActiveTab('pour-vous')}
          >
            Pour vous
          </button>
          <button 
            className={`tab ${activeTab === 'amis' ? 'active' : ''}`}
            onClick={() => setActiveTab('amis')}
          >
            Amis
          </button>
          <button 
            className={`tab ${activeTab === 'groupes' ? 'active' : ''}`}
            onClick={() => setActiveTab('groupes')}
          >
            Groupes
          </button>
        </div>

        {activeTab === 'groupes' ? (
          <div className="groups-section">
            <div className="groups-search">
              <Input
                placeholder="Rechercher un groupe..."
                icon={<Search size={20} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="groups-list">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <article
                    key={group.id}
                    className="group-card"
                    onClick={() => navigate(`/social/group/${group.id}`)}
                  >
                    <div className="group-card-inner">
                      <div className="group-photo-wrap">
                        {group.cover_url ? (
                          <img
                            src={group.cover_url}
                            alt=""
                            className="group-photo-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget.nextElementSibling
                              if (fallback) (fallback as HTMLElement).style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <span
                          className="group-photo-fallback"
                          style={group.cover_url ? { display: 'none' } : undefined}
                        >
                          {group.name.charAt(0)}
                        </span>
                      </div>
                      <div className="group-body">
                        {group.category ? (
                          <span className="group-category">{group.category}</span>
                        ) : null}
                        <span className="group-members-badge">{group.members} membres</span>
                        <h3 className="group-name">{group.name}</h3>
                        <p className="group-description">{group.description}</p>
                        <Button
                          variant={group.joined ? 'outline' : 'secondary'}
                          className="group-join-btn"
                          onClick={(e) => {
                            e?.stopPropagation()
                            handleJoinGroup(group.id)
                          }}
                        >
                          {group.joined ? 'Membre' : 'Rejoindre'}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="no-results">
                  <p>Aucun groupe trouvé</p>
                  {searchQuery && (
                    <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
                      Essayez avec d'autres mots-clés
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="create-post-section">
              <div className="create-post-input" onClick={() => navigate('/social/create-post')}>
                <div className="create-avatar">+</div>
                <span>Créer une publication...</span>
                <div className="create-post-icons">
                  <Search 
                    size={20} 
                    onClick={() => navigate('/social/search-users')}
                    style={{ cursor: 'pointer' }}
                  />
                  <Camera size={20} />
                </div>
              </div>
            </div>

            <div className="feed-posts">
              {loading && posts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p>Chargement...</p>
                </div>
              ) : error && posts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
                  <p>{error}</p>
                  <Button variant="outline" onClick={() => loadFeed(true)} style={{ marginTop: '10px' }}>
                    Réessayer
                  </Button>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => {
                  const videoUrl = post.video_url ?? (post as { videoUrl?: string }).videoUrl
                  return (
                  <div key={post.id} className="post-card">
                    {videoUrl && (
                      <video src={videoUrl} controls playsInline className="post-video" />
                    )}
                    {post.image_url && !videoUrl && (
                      <img src={post.image_url} alt="Post" className="post-image" />
                    )}
                    <div className="post-content">
                      <div className="post-header">
                        <span className="post-author">{getUserName(post)}</span>
                        <span className="post-time">{formatTime(post.created_at)}</span>
                      </div>
                      {post.content && (
                        <p className="post-text">{post.content}</p>
                      )}
                      <div className="post-engagement">
                        <button 
                          onClick={() => handleLike(post.id)}
                          style={{ 
                            color: likedPosts.has(post.id) ? '#FF3131' : 'inherit' 
                          }}
                        >
                          <Heart 
                            size={18} 
                            fill={likedPosts.has(post.id) ? '#FF3131' : 'none'} 
                          />{' '}
                          {post.likes_count || 0}
                        </button>
                        <button 
                          onClick={() => navigate(`/social/post/${post.id}`)}
                        >
                          <MessageCircle size={18} /> {post.comments_count || 0}
                        </button>
                        <button onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: getUserName(post), text: post.content || '', url: window.location.href })
                          }
                        }}>
                          <Share2 size={18} /> {post.shares_count || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p>Aucun post à afficher</p>
                </div>
              )}
              
              {nextCursor && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Button variant="outline" onClick={() => loadFeed(false)} disabled={loading}>
                    {loading ? 'Chargement...' : 'Charger plus'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default SocialFeed

