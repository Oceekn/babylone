import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Phone, Video, Paperclip, Camera, Mic } from 'lucide-react'
import './GroupChat.css'

const GroupChat = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  const messages = [
    { id: 1, sender: 'Aisha', text: "Hey everyone?", isMe: false },
    { id: 2, sender: 'You', text: "Hey Aisha", isMe: true },
    { id: 3, sender: 'Fatou', text: "Hey guys! My day's been busy", isMe: false },
    { id: 4, sender: 'Moussa', text: "Hey all, my day's been a bit hectic", isMe: false },
    { id: 5, sender: 'You', text: "Sounds like we're all keeping busy!", isMe: true },
    { id: 6, sender: 'Aisha', text: "Just catching up on some reading", isMe: false }
  ]

  return (
    <ScreenLayout
      title="The A-Team"
      showBack
      rightAction={
        <div style={{ display: 'flex', gap: '12px' }}>
          <Phone size={24} />
          <Video size={24} />
        </div>
      }
      showBottomNav
    >
      <div className="group-chat">
        <div className="group-info-bar">
          <span>4 members</span>
        </div>
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.isMe ? 'me' : 'other'}`}>
              <span className="message-sender">{msg.sender}:</span>
              <p className="message-text">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <button className="input-icon-btn">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="input-icon-btn">
            <Camera size={20} />
          </button>
          <button className="input-icon-btn">
            <Mic size={20} />
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupChat



