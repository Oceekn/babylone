import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { ChevronRight, LogOut } from 'lucide-react'
import { authService } from '../../services/auth.service'
import './ProfessionalSettings.css'

const ProfessionalSettings = () => {
  const navigate = useNavigate()
  const [autoAvailability, setAutoAvailability] = useState(() => {
    return localStorage.getItem('pro_auto_availability') === 'true'
  })

  const handleToggle = () => {
    const newVal = !autoAvailability
    setAutoAvailability(newVal)
    localStorage.setItem('pro_auto_availability', String(newVal))
  }

  const handleLogout = () => {
    authService.logout()
  }

  const settings = [
    {
      title: 'Compte',
      items: [
        {
          label: 'Modifier le profil',
          description: 'Modifier vos informations personnelles',
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
          label: 'Disponibilite automatique',
          description: 'Definir les heures de travail regulieres',
          action: (
            <label className="toggle-container">
              <input type="checkbox" checked={autoAvailability} onChange={handleToggle} />
              <span className="toggle-slider" />
            </label>
          ),
        }
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
    <ScreenLayout title="Parametres professionnels" showBack showBottomNav>
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
