import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { MessagesListContent } from '../messages/MessagesList'
import { PROFESSIONAL_MESSAGES_BASE } from '../../utils/professionalMessages'
import './ProfessionalInbox.css'

type InboxTab = 'messages' | 'notifications'

const ProfessionalInbox = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState<InboxTab>('messages')

  return (
    <ScreenLayout
      title={tab === 'messages' ? 'Messages' : 'Notifications'}
      showBack
      showBottomNav
    >
      <div className="pro-inbox">
        <div className="pro-inbox-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'messages'}
            className={tab === 'messages' ? 'active' : ''}
            onClick={() => setTab('messages')}
          >
            Messages
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'notifications'}
            className={tab === 'notifications' ? 'active' : ''}
            onClick={() => setTab('notifications')}
          >
            Notifications
          </button>
        </div>

        {tab === 'messages' && (
          <div className="pro-inbox-panel">
            <div className="messages-list">
              <MessagesListContent messagesBasePath={PROFESSIONAL_MESSAGES_BASE} />
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="pro-notifications-panel">
            <p>
              Les alertes liées à vos réservations et à votre activité apparaîtront ici. Vous pouvez déjà régler vos
              préférences de notification.
            </p>
            <Button
              variant="outline"
              fullWidth
              className="pro-notifications-settings-btn"
              onClick={() => navigate('/profile/notifications')}
            >
              Paramètres de notification
            </Button>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalInbox
