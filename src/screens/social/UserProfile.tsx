import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Share, Loader, UserPlus, UserMinus } from 'lucide-react'
import { api } from '../../services/api'
import { authService } from '../../services/auth.service'
import { socialService } from '../../services/social.service'
import './UserProfile.css'

interface UserData {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  email?: string
  telephone?: string
}

interface Post {
  id: string
  content: string
  image_url?: string
  video_url?: string
  likes_count: number
  comments_count: number
  created_at: string
}

interface HighlightStoryRow {
  story: { id: string; media_url?: string }
}

interface Highlight {
  id: string
  title: string
  highlight_stories?: HighlightStoryRow[]
}

interface Story {
  id: string
  media_url?: string
  text?: string
  user?: UserData
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUserId = authService.getUserFromToken()?.sub ?? null
  const isOwnProfile = id === currentUserId

  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts')

  useEffect(() => {
    if (id) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadData = async () => {
    if (!id) return
    const ownProfile = id === currentUserId
    try {
      setLoading(true)
      const allPromises = [
        api.get<UserData>(`/users/${id}`),
        api.get<Post[]>(`/social/users/${id}/posts`),
        api.get<Highlight[]>(`/social/users/${id}/highlights`),
        socialService.getFollowCounts(id),
        ...(ownProfile ? [] : [socialService.getFollowStatus(id)]),
      ]
      const results = await Promise.allSettled(allPromises)
      const [userData, postsData, highlightsData, countsRes, statusRes] = results

      if (userData.status === 'fulfilled') setUser(userData.value as UserData)
      if (postsData.status === 'fulfilled') setPosts(postsData.value as Post[])
      if (highlightsData.status === 'fulfilled') setHighlights(Array.isArray(highlightsData.value) ? (highlightsData.value as Highlight[]) : [])
      const counts = countsRes.status === 'fulfilled' && countsRes.value ? (countsRes.value as { followers: number; following: number }) : null
      if (counts) {
        setFollowersCount(counts.followers ?? 0)
        setFollowingCount(counts.following ?? 0)
      }
      if (statusRes && statusRes.status === 'fulfilled' && statusRes.value) {
        setFollowing(!!(statusRes.value as { following: boolean }).following)
      }
    } catch (err) {
      console.error('Erreur profil:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!id || followLoading || isOwnProfile) return
    try {
      setFollowLoading(true)
      if (following) {
        await socialService.unfollow(id)
        setFollowing(false)
        setFollowersCount((c) => Math.max(0, c - 1))
      } else {
        await socialService.follow(id)
        setFollowing(true)
        setFollowersCount((c) => c + 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFollowLoading(false)
    }
  }

  const openHighlight = async (highlightId: string) => {
    try {
      const { stories } = await api.get<{ highlight: Highlight; stories: Story[] }>(`/social/highlights/${highlightId}`)
      if (stories?.length > 0) {
        navigate(`/social/story/${stories[0].id}`, { state: { stories } })
      }
    } catch {
      // ignore
    }
  }

  const getFullName = () => {
    if (!user) return 'Utilisateur'
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur'
  }

  if (loading) {
    return (
      <ScreenLayout title="" showBack showBottomNav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="" showBack rightAction={<Share size={24} />} showBottomNav>
      <div className="user-profile">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling
                  if (fallback) (fallback as HTMLElement).style.display = 'flex'
                }}
              />
            ) : null}
            <span className="profile-avatar-fallback" style={user?.avatar_url ? { display: 'none' } : undefined}>
              {getFullName().charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="profile-name">{getFullName()}</h2>
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-number">{posts.length}</span>
              <span className="stat-label">Publications</span>
            </div>
            <button
              type="button"
              className="stat-box stat-box-clickable"
              onClick={() => id && navigate(`/social/profile/${id}/followers`)}
            >
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">Abonnés</span>
            </button>
            <button
              type="button"
              className="stat-box stat-box-clickable"
              onClick={() => id && navigate(`/social/profile/${id}/following`)}
            >
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">Abonnements</span>
            </button>
          </div>
          <div className="profile-actions">
            {!isOwnProfile && (
              <Button
                variant={following ? 'outline' : 'primary'}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? '...' : following ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserMinus size={18} /> Abonné
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserPlus size={18} /> S'abonner
                  </span>
                )}
              </Button>
            )}
            {!isOwnProfile && (
              <Button variant="outline" onClick={() => navigate('/messages/new')}>Message</Button>
            )}
            {isOwnProfile && (
              <Button variant="primary" onClick={() => navigate('/profile/edit')}>Modifier le profil</Button>
            )}
          </div>
        </div>

        {highlights.length > 0 && (
          <div className="profile-highlights">
            <div className="profile-highlights-scroll">
              {highlights.map((h) => {
                const cover = h.highlight_stories?.[0]?.story?.media_url
                return (
                  <button
                    key={h.id}
                    type="button"
                    className="profile-highlight-item"
                    onClick={() => openHighlight(h.id)}
                  >
                    <div className="profile-highlight-circle">
                      {cover ? (
                        <img src={cover} alt="" />
                      ) : (
                        <span>{h.title.charAt(0)}</span>
                      )}
                    </div>
                    <span className="profile-highlight-title">{h.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="profile-tabs">
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Publications</button>
          <button className={`tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>A propos</button>
        </div>

        {activeTab === 'posts' && (
          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="posts-empty">
                <p>Aucune publication</p>
              </div>
            ) : (
              posts.map((post) => {
                const videoUrl = post.video_url ?? (post as { videoUrl?: string }).videoUrl
                return (
                  <button
                    key={post.id}
                    type="button"
                    className="post-thumbnail"
                    onClick={() => navigate(`/social/post/${post.id}`)}
                  >
                    {videoUrl ? (
                      <video src={videoUrl} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : post.image_url ? (
                      <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="post-thumbnail-text">{post.content?.substring(0, 80) || '…'}</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'about' && user && (
          <div className="profile-about">
            {user.telephone && (
              <div className="about-row">
                <span className="about-label">Téléphone</span>
                <span className="about-value">{user.telephone}</span>
              </div>
            )}
            {user.email && (
              <div className="about-row">
                <span className="about-label">Email</span>
                <span className="about-value">{user.email}</span>
              </div>
            )}
            {!user.telephone && !user.email && (
              <p className="about-empty">Aucune information</p>
            )}
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default UserProfile
