import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Share, Loader } from 'lucide-react'
import { api } from '../../services/api'
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
  likes_count: number
  comments_count: number
  created_at: string
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts')

  useEffect(() => { if (id) loadData() }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [userData, postsData] = await Promise.allSettled([
        api.get<UserData>(`/users/${id}`),
        api.get<Post[]>(`/social/users/${id}/posts`),
      ])
      if (userData.status === 'fulfilled') setUser(userData.value as UserData)
      if (postsData.status === 'fulfilled') setPosts(postsData.value as Post[])
    } catch (err) {
      console.error('Erreur profil:', err)
    } finally {
      setLoading(false)
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
              <img src={user.avatar_url} alt="" />
            ) : (
              getFullName().charAt(0)
            )}
          </div>
          <h2 className="profile-name">{getFullName()}</h2>
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-number">{posts.length}</span>
              <span className="stat-label">Publications</span>
            </div>
          </div>
          <div className="profile-actions">
            <Button variant="secondary" onClick={() => navigate('/messages/new')}>Message</Button>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Publications</button>
          <button className={`tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>A propos</button>
        </div>

        {activeTab === 'posts' && (
          <div className="posts-grid">
            {posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '20px', gridColumn: '1 / -1' }}>Aucune publication</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-thumbnail">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <p style={{ fontSize: '12px', padding: '8px', overflow: 'hidden' }}>{post.content?.substring(0, 50)}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && user && (
          <div style={{ padding: '16px' }}>
            {user.telephone && <p style={{ marginBottom: '8px' }}>Tel: {user.telephone}</p>}
            {user.email && <p>Email: {user.email}</p>}
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default UserProfile
