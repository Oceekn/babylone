import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import { Search, Edit, Plus } from 'lucide-react'
import { chatService, Conversation } from '../../services/chat.service'
import './MessagesList.css'

const MessagesList = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'group'>('all')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  // Recharger la liste quand on revient sur l'écran (ex. après avoir ouvert un chat → le point non lu disparaît)
  useEffect(() => {
    const onFocus = () => loadConversations()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await chatService.getConversations()
      setConversations(data || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement des conversations:', err)
      setError('Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m`
    }
    if (diffInHours < 24) {
      return `${diffInHours}h`
    }
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Hier'
    if (diffInDays < 7) return `${diffInDays}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const filteredMessages = conversations.filter(conv => {
    // Filtrage par type
    if (activeTab === 'individual' && conv.type !== 'individual') return false
    if (activeTab === 'group' && conv.type !== 'group') return false
    
    // Filtrage par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return conv.name?.toLowerCase().includes(query) || 
             conv.last_message?.toLowerCase().includes(query)
    }
    return true
  })

  return (
    <ScreenLayout 
      title="Messages" 
      rightAction={<Edit size={24} />}
      showBottomNav
    >
      <div className="messages-list">
        <div className="search-section">
          <Input
            placeholder="Rechercher"
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ padding: '10px', textAlign: 'center', color: '#FF3131', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tous
          </button>
          <button 
            className={`tab ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            Individuels
          </button>
          <button 
            className={`tab ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            Groupes
          </button>
        </div>

        <div className="messages-container">
          {loading && conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Chargement...</p>
            </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((conv) => (
              <div
                key={conv.id}
                className="message-item"
                onClick={() => navigate(`/messages/chat/${conv.id}`)}
              >
                <div className="message-avatar">
                  {conv.avatar_url ? (
                    <img src={conv.avatar_url} alt={conv.name} />
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      {(conv.name || 'C').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-name">{conv.name || 'Conversation'}</span>
                    {conv.last_message_at && (
                      <span className="message-time">{formatTime(conv.last_message_at)}</span>
                    )}
                  </div>
                  <p className={`message-preview ${conv.unread_count && conv.unread_count > 0 ? 'unread' : ''}`}>
                    {conv.unread_count && conv.unread_count > 0 && conv.last_message_sender_name ? (
                      <>
                        <span className="unread-dot" aria-hidden />
                        <span className="sender-name">{conv.last_message_sender_name}: </span>
                        {conv.last_message || 'Message'}
                      </>
                    ) : (
                      conv.last_message || 'Aucun message'
                    )}
                  </p>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Aucune conversation</p>
            </div>
          )}
        </div>

        <button className="fab" onClick={() => navigate('/messages/new')}>
          <Plus size={24} />
        </button>
      </div>
    </ScreenLayout>
  )
}

export default MessagesList

