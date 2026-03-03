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
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setError(null)
    if (query.trim().length < 2) {
      setUsers([])
      setSearched(false)
      return
    }
    try {
      setLoading(true)
      setSearched(true)
      console.log('Recherche utilisateurs avec query:', query.trim())
      const results = await usersService.searchUsers(query.trim())
      console.log('Résultats recherche:', results)
      setUsers(Array.isArray(results) ? results : [])
      if (!Array.isArray(results) || results.length === 0) {
        setError(null) // Pas d'erreur, juste aucun résultat
      }
    } catch (err: any) {
      console.error('Erreur recherche:', err)
      console.error('Détails erreur:', err?.response?.data || err?.message)
      const errorMsg = err?.response?.data?.message || err?.message || 'Erreur lors de la recherche'
      setError(errorMsg)
      setUsers([])
      setSearched(true)
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
                    <span>
                      {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                      {!user.first_name && !user.last_name && (user.telephone?.charAt(0) || user.email?.charAt(0) || 'U')}
                    </span>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.telephone || user.email || 'Utilisateur'}
                  </span>
                  <span className="user-title">
                    {user.telephone || user.email || ''}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e?.stopPropagation()
                    navigate(`/social/profile/${user.id}`)
                  }}
                >
                  Voir
                </Button>
              </div>
            ))
          ) : error ? (
            <div className="no-results">
              <p style={{ color: '#FF3131' }}>Erreur: {error}</p>
            </div>
          ) : searched ? (
            <div className="no-results">
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="no-results">
              <p style={{ color: '#888' }}>Tapez au moins 2 caractères pour rechercher</p>
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default SearchUsers
