import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Bell, Star, Heart, MessageCircle, Share2 } from 'lucide-react'
import './ProfessionalDashboard.css'

const ProfessionalDashboard = () => {
  const navigate = useNavigate()
  
  return (
    <ScreenLayout
      title="Dashboard"
      rightAction={<Bell size={24} />}
      showBottomNav
    >
      <div className="professional-dashboard">
        <h2 className="greeting">Bonjour, Awa</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <p className="metric-label">Réservations du jour</p>
            <p className="metric-value">2</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Revenus du mois</p>
            <p className="metric-value">1,200,000 FCFA</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Note moyenne</p>
            <p className="metric-value">4.8 ★</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Profil vues</p>
            <p className="metric-value">150</p>
          </div>
        </div>
        <div className="today-reservations">
          <h3>Réservations d'aujourd'hui</h3>
          <div 
            className="reservation-item"
            onClick={() => navigate('/professional/bookings/active/1')}
            style={{ cursor: 'pointer' }}
          >
            <div className="res-avatar">👤</div>
            <div className="res-info">
              <p className="res-service">Coiffure avec Fatou</p>
              <p className="res-time">10:00 AM - 11:00 AM</p>
            </div>
          </div>
          <div 
            className="reservation-item"
            onClick={() => navigate('/professional/bookings/active/2')}
            style={{ cursor: 'pointer' }}
          >
            <div className="res-avatar">👤</div>
            <div className="res-info">
              <p className="res-service">Manucure avec Amina</p>
              <p className="res-time">12:00 PM - 01:00 PM</p>
            </div>
          </div>
        </div>
        <div className="quick-actions">
          <Button variant="outline" fullWidth onClick={() => navigate('/professional/calendar')}>
            Voir calendrier
          </Button>
          <Button variant="outline" fullWidth onClick={() => navigate('/professional/services')}>
            Gérer services
          </Button>
        </div>
        <div className="recent-reviews">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>Avis récents</h3>
            <button 
              onClick={() => navigate('/professional/reviews')}
              style={{ background: 'none', border: 'none', color: '#125CED', cursor: 'pointer', fontSize: '14px' }}
            >
              Voir tout
            </button>
          </div>
          <div className="review-card">
            <div className="review-header">
              <div className="review-avatar">👤</div>
              <div>
                <p className="review-author">Nadia</p>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
            <p className="review-text">
              Fatou est une coiffeuse exceptionnelle. Elle a compris exactement ce que je voulais et a fait un travail incroyable. Je suis très satisfaite et je la recommande vivement.
            </p>
            <div className="review-engagement">
              <button><Heart size={18} /> 2</button>
              <button><MessageCircle size={18} /> 0</button>
              <button><Share2 size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalDashboard

