import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { CheckCircle, ChevronRight } from 'lucide-react'
import './ProfessionalProfileScreen.css'

const ProfessionalProfileScreen = () => {
  const navigate = useNavigate()
  
  return (
    <ScreenLayout title="Profil" showBack showBottomNav>
      <div className="professional-profile-screen">
        <div className="profile-header">
          <div className="prof-avatar-large">👤</div>
          <div className="prof-details">
            <h2>Jean-Pierre</h2>
            <p>@Dakar</p>
            <p className="join-date">Joined 2021</p>
          </div>
        </div>
        <div className="business-info">
          <h3>Business Information</h3>
          <div className="business-images">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="business-image">📦</div>
            ))}
          </div>
        </div>
        <div className="documents-section">
          <h3>Documents</h3>
          <div className="document-item">
            <span>ID-Card</span>
            <div className="doc-status verified">
              <CheckCircle size={16} />
              <span>Verified</span>
            </div>
          </div>
          <div className="document-item">
            <span>Business License</span>
            <div className="doc-status pending">
              <span className="status-dot"></span>
              <span>Pending</span>
            </div>
          </div>
          <Button variant="outline" fullWidth>Upload Document</Button>
        </div>
        <div className="gallery-section">
          <h3>Professional Gallery</h3>
          <div className="gallery-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="gallery-item">🖼️</div>
            ))}
          </div>
          <Button variant="outline" fullWidth>Add Photos</Button>
        </div>
        <div className="pricing-section">
          <h3>Pricing</h3>
          <div className="pricing-item">
            <div>
              <p className="service-name">Plumbing Services</p>
              <p className="service-price">Starting at $50</p>
            </div>
            <ChevronRight size={20} />
          </div>
          <div className="pricing-item">
            <div>
              <p className="service-name">Electrical Services</p>
              <p className="service-price">Starting at $75</p>
            </div>
            <ChevronRight size={20} />
          </div>
          <div className="pricing-item">
            <div>
              <p className="service-name">Carpentry Services</p>
              <p className="service-price">Starting at $60</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
        <div className="settings-section" style={{ marginTop: '24px' }}>
          <div 
            className="setting-item"
            onClick={() => navigate('/professional/reviews')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'transparent', borderRadius: '0', border: 'none', marginBottom: '12px' }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)' }}>Avis et commentaires</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--dark-grey)' }}>Gérer vos avis clients</p>
            </div>
            <ChevronRight size={20} />
          </div>
          <div 
            className="setting-item"
            onClick={() => navigate('/professional/settings')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'transparent', borderRadius: '0', border: 'none' }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)' }}>Paramètres</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--dark-grey)' }}>Paramètres professionnels</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalProfileScreen

