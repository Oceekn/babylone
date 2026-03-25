import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import { ChevronRight, LogOut } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { chatSocketService } from '../../services/chat-socket.service'
import './ProfessionalSettings.css'

const ProfessionalSettings = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    chatSocketService.disconnect()
    authService.logout()
    navigate('/login', { replace: true })
  }

  type SettingItem = { label: string; description: string; onClick?: () => void; action: React.ReactNode }
  const settings: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Compte',
      items: [
        {
          label: 'Fiche professionnelle',
          description: 'Prénom, nom, nom commercial, domaine (ex. informatique), adresse et position GPS',
          onClick: () => navigate('/professional/profile/edit'),
          action: <ChevronRight size={20} />,
        },
        {
          label: 'Modifier le profil',
          description: 'Photo, email et informations personnelles',
          onClick: () => navigate('/profile/edit'),
          action: <ChevronRight size={20} />,
        },
        {
          label: 'Parametres de notification',
          description: 'Configurer les notifications',
          onClick: () => navigate('/profile/notifications'),
          action: <ChevronRight size={20} />,
        },
        {
          label: 'Confidentialite',
          description: 'Gerer la visibilite de votre profil',
          onClick: () => navigate('/profile/privacy'),
          action: <ChevronRight size={20} />,
        },
      ]
    },
    {
      title: 'Disponibilite',
      items: [
        {
          label: 'Horaires de reservation',
          description: 'Plage horaire des creneaux proposés aux clients (ex. 8h–19h)',
          onClick: () => navigate('/professional/availability'),
          action: <ChevronRight size={20} />,
        },
      ]
    },
    {
      title: 'Politiques',
      items: [
        {
          label: 'Politique d\'annulation',
          description: 'Definir les conditions d\'annulation pour les clients',
          action: <ChevronRight size={20} />,
        },
        {
          label: 'Frais de deplacement',
          description: 'Definir les frais de deplacement pour les services',
          action: <ChevronRight size={20} />,
        }
      ]
    }
  ]

  return (
    <ScreenLayout title="Parametres professionnels" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
      <div className="professional-settings">
        {settings.map((section, sectionIndex) => (
          <div key={sectionIndex} className="settings-section">
            <h3 className="section-title">{section.title}</h3>
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="setting-item"
                onClick={item.onClick}
                style={{ cursor: item.onClick ? 'pointer' : 'default' }}
              >
                <div className="setting-info">
                  <p className="setting-label">{item.label}</p>
                  <p className="setting-description">{item.description}</p>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        ))}

        <div className="settings-section">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Se deconnecter</span>
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalSettings
