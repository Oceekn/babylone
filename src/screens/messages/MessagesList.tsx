import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import { Search, Edit, Plus } from 'lucide-react'
import { chatService, Conversation } from '../../services/chat.service'
import { formatConversationListTime } from '../../utils/chatTime'
import './MessagesList.css'

export type MessagesListContentProps = {
  messagesBasePath: string
}

/** Liste des conversations réutilisable (client `/messages` ou pro `/professional/messages`). */
export function MessagesListContent({ messagesBasePath }: MessagesListContentProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'group'>('all')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

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
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des conversations:', err)
      setError('Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }

  const filteredMessages = conversations.filter((conv) => {
    if (activeTab === 'individual' && conv.type !== 'individual') return false
    if (activeTab === 'group' && conv.type !== 'group') return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        conv.name?.toLowerCase().includes(query) || conv.last_message?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const chatPath = (conv: Conversation) =>
    conv.type === 'group'
      ? `${messagesBasePath}/group/${conv.id}`
      : `${messagesBasePath}/chat/${conv.id}`

  return (
    <>
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
          type="button"
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tous
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          Individuels
        </button>
        <button
          type="button"
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
          filteredMessages.map((conv) => {
            const hasUnread = !!(conv.unread_count && conv.unread_count > 0)
            return (
              <div
                key={conv.id}
                className={`message-item ${hasUnread ? 'has-unread' : ''}`}
                onClick={() => navigate(chatPath(conv))}
              >
                <div className="message-avatar">
                  {conv.avatar_url && (
                    <img
                      src={conv.avatar_url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling
                        if (fallback instanceof HTMLElement) fallback.style.display = 'flex'
                      }}
                    />
                  )}
                  <span
                    className="message-avatar-initial"
                    style={{ display: conv.avatar_url ? 'none' : 'flex' }}
                    aria-hidden
                  >
                    {(conv.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="message-body">
                  <div className="message-row message-row-top">
                    <span className="message-name">{conv.name || 'Conversation'}</span>
                    <span className="message-meta">
                      {conv.last_message_at && (
                        <span className="message-time">{formatConversationListTime(conv.last_message_at)}</span>
                      )}
                      {hasUnread && (
                        <span className="message-unread-badge">
                          {conv.unread_count! > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="message-row message-row-preview">
                    <p className={`message-preview ${hasUnread ? 'unread' : ''}`}>
                      {hasUnread && conv.last_message_sender_name && (
                        <>
                          <span className="unread-dot" aria-hidden />
                          <span className="sender-name">{conv.last_message_sender_name}: </span>
                        </>
                      )}
                      {conv.last_message || 'Aucun message'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Aucune conversation</p>
          </div>
        )}
      </div>

      <button type="button" className="fab" onClick={() => navigate(`${messagesBasePath}/new`)}>
        <Plus size={24} />
      </button>
    </>
  )
}

const MessagesList = () => {
  return (
    <ScreenLayout title="Messages" rightAction={<Edit size={24} />} showBottomNav>
      <div className="messages-list">
        <MessagesListContent messagesBasePath="/messages" />
      </div>
    </ScreenLayout>
  )
}

export default MessagesList
