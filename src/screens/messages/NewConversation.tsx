import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import { chatService } from '../../services/chat.service'
import './NewConversation.css'

const NewConversation = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    try {
      setLoading(true)
      const users = await usersService.searchUsers(query.trim())
      setResults(users)
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err)
    } finally {
      setLoading(false)
    }
  }

  const startConversation = async (user: User) => {
    try {
      setCreating(true)
      // Creer ou recuperer la conversation individuelle avec cet utilisateur
      const conversation = await chatService.createIndividualConversation(user.id)
      navigate(`/messages/chat/${conversation.id}`)
    } catch (err) {
      console.error('Erreur creation conversation:', err)
    } finally {
      setCreating(false)
    }
  }

  const getUserName = (user: User) => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim()
    return name || user.telephone
  }

  return (
    <ScreenLayout title="Nouveau message" showBack showBottomNav>
      <div className="new-conversation">
        <div className="search-section">
          <Input
            placeholder="Rechercher par nom, telephone..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="contacts-list">
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Recherche...</p>
          ) : searchQuery.length < 2 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Tapez au moins 2 caracteres pour rechercher
            </p>
          ) : results.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Aucun utilisateur trouve
            </p>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="contact-item"
                onClick={() => !creating && startConversation(user)}
                style={{ opacity: creating ? 0.5 : 1 }}
              >
                <div className="contact-avatar">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{getUserName(user).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="contact-info">
                  <span className="contact-name">{getUserName(user)}</span>
                  <span className="contact-status">{user.telephone}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="secondary" fullWidth onClick={() => navigate('/messages/group/new')}>
          Creer un groupe
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default NewConversation
