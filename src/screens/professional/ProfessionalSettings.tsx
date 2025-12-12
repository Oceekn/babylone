import ScreenLayout from '../../components/common/ScreenLayout'
import { ChevronRight } from 'lucide-react'
import './ProfessionalSettings.css'

const ProfessionalSettings = () => {
  const settings = [
    {
      title: 'Notifications',
      items: [
        { label: 'Paramètres de notification', description: 'Recevoir des notifications pour les nouvelles demandes de service', icon: <ChevronRight size={20} /> }
      ]
    },
    {
      title: 'Disponibilité',
      items: [
        { label: 'Disponibilité automatique', description: 'Définir les heures de travail régulières', icon: <input type="checkbox" className="toggle-switch" /> }
      ]
    },
    {
      title: 'Politiques',
      items: [
        { label: 'Politique d\'annulation', description: 'Définir les mesures d\'annulation pour les clients', icon: <ChevronRight size={20} /> },
        { label: 'Frais de déplacement', description: 'Définir les frais de déplacement pour les services fournis', icon: <ChevronRight size={20} /> }
      ]
    }
  ]

  return (
    <ScreenLayout title="Paramètres professionnels" showBack showBottomNav>
      <div className="professional-settings">
        {settings.map((section, sectionIndex) => (
          <div key={sectionIndex} className="settings-section">
            <h3 className="section-title">{section.title}</h3>
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="setting-item">
                <div className="setting-info">
                  <p className="setting-label">{item.label}</p>
                  <p className="setting-description">{item.description}</p>
                </div>
                {item.icon}
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalSettings



