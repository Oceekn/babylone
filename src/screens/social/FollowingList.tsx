import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Loader } from 'lucide-react'
import { socialService } from '../../services/social.service'
import './FollowingList.css'

type UserListItem = { id: string; first_name?: string; last_name?: string; avatar_url?: string; telephone?: string }

const FollowingList = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadFollowing()
  }, [id])

  const loadFollowing = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await socialService.getFollowing(id)
      const list = Array.isArray(data) ? data.map((item) => ({ id: item.following.id, first_name: item.following.first_name, last_name: item.following.last_name, avatar_url: item.following.avatar_url })) : []
      setUsers(list)
    } catch (err) {
      console.error('Erreur chargement abonnements:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout title="Abonnements" showBack showBottomNav>
      <div className="following-list">
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
            <p>Aucun abonnement</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default FollowingList
