import { useState } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import './NotificationsSettings.css'

interface NotifSettings {
  [key: string]: boolean
}

const NotificationsSettings = () => {
  const [settings, setSettings] = useState<NotifSettings>(() => {
    const stored = localStorage.getItem('notification_settings')
    return stored ? JSON.parse(stored) : {
      msg_sounds: true,
      msg_vibration: true,
      msg_preview: true,
      social_likes: true,
      social_comments: true,
      social_friends: true,
      booking_confirmations: true,
      booking_reminders: true,
      booking_updates: true,
      promotions: false,
      dnd: false,
    }
  })

  const toggle = (key: string) => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    localStorage.setItem('notification_settings', JSON.stringify(updated))
  }

  const categories = [
    {
      title: 'Messages',
      items: [
        { key: 'msg_sounds', label: 'Sons', description: 'Jouer un son lorsque vous recevez un message' },
        { key: 'msg_vibration', label: 'Vibrations', description: 'Vibrer lorsque vous recevez un message' },
        { key: 'msg_preview', label: 'Apercu', description: 'Afficher un apercu du message' },
      ]
    },
    {
      title: 'Social',
      items: [
        { key: 'social_likes', label: 'Likes', description: 'Notifications pour les likes' },
        { key: 'social_comments', label: 'Commentaires', description: 'Notifications pour les commentaires' },
        { key: 'social_friends', label: 'Demandes d\'amis', description: 'Notifications pour les demandes d\'amis' },
      ]
    },
    {
      title: 'Reservations',
      items: [
        { key: 'booking_confirmations', label: 'Confirmations', description: 'Notifications de confirmations' },
        { key: 'booking_reminders', label: 'Rappels', description: 'Rappels de reservations' },
        { key: 'booking_updates', label: 'Mises a jour', description: 'Mises a jour de statut' },
      ]
    },
    {
      title: 'Promotions',
      items: [
        { key: 'promotions', label: 'Promotions', description: 'Offres et promotions' },
      ]
    },
    {
      title: 'Ne pas deranger',
      items: [
        { key: 'dnd', label: 'Activer', description: 'Desactiver toutes les notifications' },
      ]
    },
  ]

  return (
    <ScreenLayout title="Notifications" showBack showBottomNav>
      <div className="notifications-settings">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="notification-category">
            <h3 className="category-title">{category.title}</h3>
            {category.items.map((item) => (
              <div key={item.key} className="notification-item">
                <div className="notification-info">
                  <p className="notification-label">{item.label}</p>
                  <p className="notification-description">{item.description}</p>
                </div>
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={settings[item.key] || false}
                    onChange={() => toggle(item.key)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScreenLayout>
  )
}

export default NotificationsSettings
