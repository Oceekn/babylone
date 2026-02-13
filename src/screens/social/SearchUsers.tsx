import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, Loader } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import './SearchUsers.css'

const SearchUsers = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setUsers([])
      setSearched(false)
      return
    }
    try {
      setLoading(true)
      setSearched(true)
      const results = await usersService.searchUsers(query.trim())
      setUsers(results)
    } catch (err) {
      console.error('Erreur recherche:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout title="Rechercher des utilisateurs" showBack showBottomNav>
      <div className="search-users">
        <div className="search-section">
          <Input
            placeholder="Rechercher un utilisateur..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="users-list">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Loader size={24} className="spin" />
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="user-item"
                onClick={() => navigate(`/social/profile/${user.id}`)}
              >
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.first_name} {user.last_name}</span>
                  <span className="user-title">{user.telephone || user.email || ''}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/social/profile/${user.id}`)
                  }}
                >
                  Voir
                </Button>
              </div>
            ))
          ) : searched ? (
            <div className="no-results">
              <p>Aucun utilisateur trouve</p>
            </div>
          ) : (
            <div className="no-results">
              <p style={{ color: '#888' }}>Tapez au moins 2 caracteres pour rechercher</p>
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default SearchUsers
