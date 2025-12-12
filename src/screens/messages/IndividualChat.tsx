import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Phone, Video, Paperclip, Camera, Mic } from 'lucide-react'
import './IndividualChat.css'

const IndividualChat = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [message, setMessage] = useState('')

  const messages = [
    { id: 1, sender: 'Nadia', text: "Hey there! How's your day going?", isMe: false },
    { id: 2, sender: 'You', text: "It's been pretty good, thanks!", isMe: true },
    { id: 3, sender: 'Nadia', text: "That's awesome! Mine's been busy", isMe: false },
    { id: 4, sender: 'You', text: "Nice! Sounds like we're both busy", isMe: true },
    { id: 5, sender: 'Nadia', text: "Thinking of catching a movie. You in?", isMe: false },
    { id: 6, sender: 'You', text: "Definitely!", isMe: true },
    { id: 7, sender: 'Nadia', text: "There's a new action flick everyone?", isMe: false },
    { id: 8, sender: 'You', text: "Comedy", isMe: true },
    { id: 9, sender: 'Nadia', text: "Great! I'll check the showtimes", isMe: false },
    { id: 10, sender: 'You', text: "7 PM works for me.", isMe: true }
  ]

  return (
    <ScreenLayout
      title="Nadia"
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
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.isMe ? 'me' : 'other'}`}>
              <p className="message-text">{msg.text}</p>
              {msg.isMe && <span className="checkmark">✓</span>}
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

export default IndividualChat

