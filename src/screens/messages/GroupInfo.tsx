import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Bell, Users, Loader } from 'lucide-react'
import { chatService, Conversation, ConversationParticipant } from '../../services/chat.service'
import './GroupInfo.css'

const GroupInfo = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadInfo() }, [id])

  const loadInfo = async () => {
    try {
      setLoading(true)
      const conversations = await chatService.getConversations()
      const conv = conversations.find(c => c.id === id)
      setConversation(conv || null)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMemberName = (p: ConversationParticipant) => {
    if (p.user) return `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() || 'Membre'
    return 'Membre'
  }

  if (loading) {
    return (
      <ScreenLayout title="Info groupe" showBack showBottomNav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (!conversation) {
    return (
      <ScreenLayout title="Info groupe" showBack showBottomNav>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Groupe introuvable</p>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Info groupe" showBack showBottomNav>
      <div className="group-info">
        <div className="group-profile">
          <div className="group-avatar-large">
            {conversation.avatar_url ? (
              <img src={conversation.avatar_url} alt="" />
            ) : (
              <Users size={32} />
            )}
          </div>
          <h2 className="group-name">{conversation.name || 'Groupe'}</h2>
          <p className="member-count">{conversation.participants?.length || 0} membres</p>
        </div>

        <div className="members-section">
          <h3 className="section-title">Membres</h3>
          <div className="members-list">
            {conversation.participants?.map((p) => (
              <div key={p.id} className="member-item" onClick={() => p.user && navigate(`/social/profile/${p.user.id}`)}>
                <div className="member-avatar">
                  {p.user?.avatar_url ? (
                    <img src={p.user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    getMemberName(p).charAt(0)
                  )}
                </div>
                <span className="member-name">{getMemberName(p)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="options-section">
          <div className="option-item">
            <Bell size={20} />
            <span>Notifications</span>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupInfo
