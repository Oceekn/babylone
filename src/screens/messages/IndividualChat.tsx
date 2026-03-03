import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Phone, Video, Paperclip, Camera, Mic, Send } from 'lucide-react'
import { chatService, Message } from '../../services/chat.service'
import { chatSocketService } from '../../services/chat-socket.service'
import { authService } from '../../services/auth.service'
import './IndividualChat.css'

const IndividualChat = () => {
  const { id } = useParams<{ id: string }>()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationName, setConversationName] = useState('Chat')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = authService.getUserFromToken()?.sub

  // Vérifier si l'ID est un UUID valide
  const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

  // Charger les messages au montage et rejoindre la conversation en temps réel
  useEffect(() => {
    if (!id || !isValidUUID(id)) {
      setError('Aucune conversation selectionnee. Allez dans Messages pour commencer.')
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [messagesRes, conversations] = await Promise.all([
          chatService.getMessages(id, { limit: 50 }),
          chatService.getConversations(),
        ])
        setMessages(messagesRes.messages || [])
        const conv = conversations.find((c) => c.id === id)
        if (conv) setConversationName(conv.name || 'Chat')
        await chatService.markAsRead(id)
      } catch (err: unknown) {
        console.error('Erreur chargement messages:', err)
        setError('Erreur lors du chargement des messages')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  // WebSocket : rejoindre la conversation et écouter les nouveaux messages
  useEffect(() => {
    if (!id || !isValidUUID(id)) return

    chatSocketService.getSocket()
    const join = async () => {
      const ack = await chatSocketService.joinConversation(id)
      if (ack?.error) {
        console.warn('Join conversation:', ack.error)
      }
    }
    join()

    const unsub = chatSocketService.onNewMessage((msg: Message) => {
      if (msg.conversation_id !== id) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      chatSocketService.leaveConversation(id)
      unsub()
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || !id) return

    const content = message.trim()
    setMessage('')

    setSending(true)
    try {
      const ack = await chatSocketService.sendMessage(id, content, 'text')
      if (ack?.error) {
        setError(ack.error)
        setMessage(content)
        return
      }
      if (ack?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === ack.message!.id)) return prev
          return [...prev, ack.message!]
        })
      }
      setError(null)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (err: unknown) {
      console.error('Erreur envoi message:', err)
      setError('Erreur lors de l\'envoi')
      setMessage(content)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getUserName = (msg: Message) => {
    if (msg.user) {
      return `${msg.user.first_name || ''} ${msg.user.last_name || ''}`.trim() || 'Utilisateur'
    }
    return 'Utilisateur'
  }

  const isMyMessage = (msg: Message) => msg.user_id === currentUserId

  return (
    <ScreenLayout
      title={conversationName}
      showBack
      rightAction={
        <div style={{ display: 'flex', gap: '12px' }}>
          <Phone size={24} />
          <Video size={24} />
        </div>
      }
      showBottomNav
    >
      <div className="individual-chat">
        {loading && messages.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Chargement des messages...</p>
          </div>
        ) : error && messages.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble ${isMyMessage(msg) ? 'me' : 'other'}`}>
                {!isMyMessage(msg) && (
                  <span className="message-sender">{getUserName(msg)}</span>
                )}
                {msg.content && (
                  <p className="message-text">{msg.content}</p>
                )}
                {msg.media_url && (
                  <img src={msg.media_url} alt="Media" className="message-media" />
                )}
                {isMyMessage(msg) && (
                  <span className="checkmark">{msg.is_read ? '✓✓' : '✓'}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="chat-input-container">
          <button type="button" className="input-icon-btn">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder="Écrire un message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {message.trim() ? (
            <button
              type="button"
              className="input-icon-btn"
              onClick={sendMessage}
              disabled={sending}
            >
              <Send size={20} />
            </button>
          ) : (
            <>
              <button type="button" className="input-icon-btn">
                <Camera size={20} />
              </button>
              <button type="button" className="input-icon-btn">
                <Mic size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default IndividualChat
