import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, AlertCircle } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import { chatService } from '../../services/chat.service'
import { DM_PRIVACY_BLOCKED_MESSAGE_FR, isDmPrivacyBlocked } from '../../utils/chatPrivacy'
import { getMessagesBasePath } from '../../utils/professionalMessages'
import './NewConversation.css'

const NewConversation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const messagesBase = getMessagesBasePath(location.pathname)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [privacyError, setPrivacyError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setPrivacyError(null)
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
      setPrivacyError(null)
      const conversation = await chatService.createIndividualConversation(user.id)
      navigate(`/messages/chat/${conversation.id}`)
    } catch (err) {
      console.error('Erreur creation conversation:', err)
      if (isDmPrivacyBlocked(err)) {
        setPrivacyError(DM_PRIVACY_BLOCKED_MESSAGE_FR)
      } else {
        setPrivacyError('Impossible de démarrer la conversation. Réessayez.')
      }
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
        {privacyError && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              margin: '0 0 12px',
              padding: 12,
              background: '#ffebee',
              color: '#b71c1c',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{privacyError}</span>
          </div>
        )}

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

        <Button variant="secondary" fullWidth onClick={() => navigate(`${messagesBase}/group/new`)}>
          Creer un groupe
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default NewConversation
