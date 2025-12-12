import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search } from 'lucide-react'
import './NewConversation.css'

const NewConversation = () => {
  const navigate = useNavigate()

  const contacts = {
    A: [
      { id: 1, name: 'Aisha', online: true, avatar: '👤' },
      { id: 2, name: 'Amadou', online: true, avatar: '👤' }
    ],
    B: [
      { id: 3, name: 'Benoit', online: false, avatar: '👤' },
      { id: 4, name: 'Blandine', online: true, avatar: '👤' }
    ],
    C: [
      { id: 5, name: 'Cyrille', online: true, avatar: '👤' }
    ]
  }

  return (
    <ScreenLayout title="Nouveau message" showBack showBottomNav>
      <div className="new-conversation">
        <div className="search-section">
          <Input
            placeholder="Rechercher un utilisateur"
            icon={<Search size={20} />}
          />
        </div>

        <div className="contacts-list">
          {Object.entries(contacts).map(([letter, group]) => (
            <div key={letter} className="contact-group">
              <div className="group-letter">{letter}</div>
              {group.map((contact) => (
                <div
                  key={contact.id}
                  className="contact-item"
                  onClick={() => navigate(`/messages/chat/${contact.id}`)}
                >
                  <div className="contact-avatar">{contact.avatar}</div>
                  <div className="contact-info">
                    <span className="contact-name">{contact.name}</span>
                    <span className={`contact-status ${contact.online ? 'online' : ''}`}>{contact.online ? 'En ligne' : 'Hors ligne'}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Button variant="secondary" fullWidth onClick={() => navigate('/messages/group/new')}>
          Créer groupe
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default NewConversation

