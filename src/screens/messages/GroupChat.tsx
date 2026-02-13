import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Phone, Video, Send, Loader, Info } from 'lucide-react'
import { chatService, Message } from '../../services/chat.service'
import { chatSocketService } from '../../services/chat-socket.service'
import { authService } from '../../services/auth.service'
import './GroupChat.css'

const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const GroupChat = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('Groupe')
  const [memberCount, setMemberCount] = useState(0)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = authService.getUserFromToken()?.sub

  useEffect(() => {
    if (!id || !isValidUUID(id)) {
      setError('Conversation de groupe invalide')
      return
    }
    loadData()
  }, [id])

  useEffect(() => {
    if (!id || !isValidUUID(id)) return

    chatSocketService.connect()
    chatSocketService.joinConversation(id)

    const handleNewMessage = (msg: Message) => {
      if (msg.conversation_id === id) {
        setMessages(prev => [...prev, msg])
        scrollToBottom()
      }
    }

    chatSocketService.onNewMessage(handleNewMessage)

    return () => {
      chatSocketService.leaveConversation(id)
    }
  }, [id])

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [messagesRes, conversations] = await Promise.all([
        chatService.getMessages(id, { limit: 50 }),
        chatService.getConversations(),
      ])
      setMessages(messagesRes.messages || [])
      const conv = conversations.find(c => c.id === id)
      if (conv) {
        setGroupName(conv.name || 'Groupe')
        setMemberCount(conv.participants?.length || 0)
      }
    } catch (err) {
      setError('Erreur chargement du groupe')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleSend = async () => {
    if (!message.trim() || !id || sending) return
    try {
      setSending(true)
      await chatService.sendMessage(id, message.trim())
      setMessage('')
    } catch (err) {
      console.error('Erreur envoi:', err)
    } finally {
      setSending(false)
    }
  }

  const getSenderName = (msg: Message) => {
    if (msg.user_id === currentUserId) return 'Vous'
    if (msg.user) return `${msg.user.first_name || ''} ${msg.user.last_name || ''}`.trim() || 'Membre'
    return 'Membre'
  }

  return (
    <ScreenLayout
      title={groupName}
      showBack
      rightAction={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Info size={22} onClick={() => navigate(`/messages/group/${id}/info`)} style={{ cursor: 'pointer' }} />
        </div>
      }
    >
      <div className="group-chat">
        <div className="group-info-bar">
          <span>{memberCount} membres</span>
        </div>

        {error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={24} className="spin" />
          </div>
        ) : (
          <div className="messages-container">
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Debut de la conversation</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble ${msg.user_id === currentUserId ? 'me' : 'other'}`}>
                {msg.user_id !== currentUserId && (
                  <span className="message-sender">{getSenderName(msg)}</span>
                )}
                <p className="message-text">{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Tapez un message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!!error}
          />
          <button className="send-btn" onClick={handleSend} disabled={!message.trim() || sending}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupChat
