import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Loader } from 'lucide-react'
import { socialService } from '../../services/social.service'
import './FollowersList.css'

type UserListItem = { id: string; first_name?: string; last_name?: string; avatar_url?: string; telephone?: string }

const FollowersList = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadFollowers()
  }, [id])

  const loadFollowers = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await socialService.getFollowers(id)
      const list = Array.isArray(data) ? data.map((item) => ({ id: item.follower.id, first_name: item.follower.first_name, last_name: item.follower.last_name, avatar_url: item.follower.avatar_url })) : []
      setUsers(list)
    } catch (err) {
      console.error('Erreur chargement abonnés:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout title="Abonnés" showBack showBottomNav>
      <div className="followers-list">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : users.length > 0 ? (
          <div className="users-list">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-item"
                onClick={() => navigate(`/social/profile/${user.id}`)}
              >
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span>
                      {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                    </span>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {user.first_name} {user.last_name}
                  </span>
                  {user.telephone && (
                    <span className="user-subtitle">{user.telephone}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Aucun abonné</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default FollowersList
