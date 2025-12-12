import ScreenLayout from '../../components/common/ScreenLayout'
import './NotificationsSettings.css'

const NotificationsSettings = () => {
  const notificationCategories = [
    {
      title: 'Messages',
      items: [
        { label: 'Sons', description: 'Jouer un son lorsque vous recevez un message' },
        { label: 'Vibrations', description: 'Vibrer lorsque vous recevez un message' },
        { label: 'Aperçu', description: 'Afficher un aperçu du message' }
      ]
    },
    {
      title: 'Social',
      items: [
        { label: 'Likes', description: 'Recevoir des notifications pour les likes' },
        { label: 'Commentaires', description: 'Recevoir des notifications pour les commentaires' },
        { label: 'Demandes d\'amis', description: 'Recevoir des notifications pour les demandes d\'amis' }
      ]
    },
    {
      title: 'Réservations',
      items: [
        { label: 'Confirmations', description: 'Recevoir des notifications pour les confirmations' },
        { label: 'Rappels', description: 'Recevoir des notifications pour les rappels' },
        { label: 'Mises à jour', description: 'Recevoir des notifications pour les mises à jour' }
      ]
    },
    {
      title: 'Promotions',
      items: [
        { label: 'Promotions', description: 'Recevoir des notifications pour les promotions' }
      ]
    },
    {
      title: 'Ne pas déranger',
      items: [
        { label: 'Planifier', description: 'Planifier les heures de ne pas déranger' }
      ]
    }
  ]

  return (
    <ScreenLayout title="Notifications Setti..." showBack showBottomNav>
      <div className="notifications-settings">
        {notificationCategories.map((category, catIndex) => (
          <div key={catIndex} className="notification-category">
            <h3 className="category-title">{category.title}</h3>
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="notification-item">
                <div className="notification-info">
                  <p className="notification-label">{item.label}</p>
                  <p className="notification-description">{item.description}</p>
                </div>
                <input type="checkbox" className="toggle-switch" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScreenLayout>
  )
}

export default NotificationsSettings



