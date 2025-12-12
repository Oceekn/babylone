import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search } from 'lucide-react'
import './SearchUsers.css'

const SearchUsers = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const users = [
    { id: 1, name: 'Aisha N.', title: 'Digital Artist', avatar: '👤', isFriend: false },
    { id: 2, name: 'Jean-Pierre', title: 'Photographer', avatar: '👤', isFriend: true },
    { id: 3, name: 'Fatou', title: 'Designer', avatar: '👤', isFriend: false },
    { id: 4, name: 'Moussa', title: 'Developer', avatar: '👤', isFriend: false },
    { id: 5, name: 'Marie', title: 'Artist', avatar: '👤', isFriend: true },
    { id: 6, name: 'Pierre', title: 'Writer', avatar: '👤', isFriend: false }
  ]

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ScreenLayout title="Rechercher des utilisateurs" showBack showBottomNav>
      <div className="search-users">
        <div className="search-section">
          <Input
            placeholder="Rechercher un utilisateur..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="users-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="user-item"
                onClick={() => navigate(`/social/profile/${user.id}`)}
              >
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-title">{user.title}</span>
                </div>
                <Button
                  variant={user.isFriend ? 'outline' : 'secondary'}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle add friend logic here
                  }}
                >
                  {user.isFriend ? 'Ami' : 'Ajouter'}
                </Button>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default SearchUsers



