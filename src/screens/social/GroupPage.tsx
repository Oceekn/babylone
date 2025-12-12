import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import { Camera } from 'lucide-react'
import './GroupPage.css'

const GroupPage = () => {
  return (
    <ScreenLayout title="Groupe" showBack showBottomNav>
      <div className="group-page">
        <div className="group-cover">👥</div>
        <div className="group-members-preview">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="member-avatar-small">👤</div>
          ))}
        </div>
        <div className="group-description">
          <p>Un groupe pour les amis de Yaoundé, pour partager des moments, des idées et des événements.</p>
        </div>
        <div className="administrators-section">
          <h3>Administrateurs</h3>
          <div className="admins-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="admin-avatar">👤</div>
            ))}
          </div>
        </div>
        <div className="publications-section">
          <h3>Publications</h3>
          <div className="create-post-mini">
            <div className="mini-avatar">👤</div>
            <Input placeholder="Écrire quelque chose..." rightIcon={<Camera size={20} />} />
          </div>
          <div className="publications-list">
            <div className="publication-item">
              <div className="pub-avatar">👤</div>
              <div className="pub-content">
                <div className="pub-header">
                  <span className="pub-author">Jean-Pierre</span>
                  <span className="pub-time">2h</span>
                </div>
                <p className="pub-text">Superbe rencontre hier soir ! Merci à tous pour votre présence et votre bonne humeur.</p>
              </div>
            </div>
            <div className="publication-item">
              <div className="pub-avatar">👤</div>
              <div className="pub-content">
                <div className="pub-header">
                  <span className="pub-author">Marie</span>
                  <span className="pub-time">3h</span>
                </div>
                <p className="pub-text">J'ai adoré l'ambiance ! On remet ça bientôt ?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupPage



