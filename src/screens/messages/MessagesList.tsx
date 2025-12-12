import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import { Search, Edit, Plus } from 'lucide-react'
import './MessagesList.css'

const MessagesList = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'group'>('all')

  const messages = [
    { id: 1, name: 'Aisha', lastMessage: 'Hey! How are you?', time: '10:30', avatar: '👤', isGroup: false },
    { id: 2, name: 'Jean-Pierre', lastMessage: 'See you tomorrow', time: '10:20', avatar: '👤', isGroup: false },
    { id: 3, name: 'Groupe Amis', lastMessage: 'Fatou: Great idea!', time: '09:15', avatar: '👥', isGroup: true },
    { id: 4, name: 'Fatou', lastMessage: 'Thanks for the help', time: '08:45', avatar: '👤', isGroup: false },
    { id: 5, name: 'Moussa', lastMessage: 'Are you free today?', time: '08:30', avatar: '👤', isGroup: false },
    { id: 6, name: 'Groupe Famille', lastMessage: 'Marie: Happy birthday!', time: 'Hier', avatar: '👥', isGroup: true }
  ]

  const filteredMessages = messages.filter(message => {
    if (activeTab === 'all') return true
    if (activeTab === 'individual') return !message.isGroup
    if (activeTab === 'group') return message.isGroup
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
          />
        </div>

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
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="message-item"
              onClick={() => navigate(`/messages/chat/${message.id}`)}
            >
              <div className="message-avatar">{message.avatar}</div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-name">{message.name}</span>
                  <span className="message-time">{message.time}</span>
                </div>
                <p className="message-preview">{message.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="fab" onClick={() => navigate('/messages/new')}>
          <Plus size={24} />
        </button>
      </div>
    </ScreenLayout>
  )
}

export default MessagesList

