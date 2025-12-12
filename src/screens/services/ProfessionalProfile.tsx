import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, Calendar } from 'lucide-react'
import './ProfessionalProfile.css'

const ProfessionalProfile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'portfolio' | 'reviews'>('about')

  const services = [
    { id: 1, name: 'Design d\'intérieur complet', price: '50,000 - 100,000 FCFA', description: 'Conception complète de votre espace intérieur' },
    { id: 2, name: 'Consultation design', price: '20,000 - 30,000 FCFA', description: 'Séance de consultation pour vos projets' },
    { id: 3, name: 'Décoration sur mesure', price: '30,000 - 60,000 FCFA', description: 'Décoration personnalisée selon vos goûts' }
  ]

  const portfolio = [
    { id: 1, image: '🏠', title: 'Appartement moderne', description: 'Design contemporain pour un appartement de 80m²' },
    { id: 2, image: '🏡', title: 'Maison familiale', description: 'Rénovation complète d\'une maison de 150m²' },
    { id: 3, image: '🏢', title: 'Bureau professionnel', description: 'Aménagement d\'un espace de travail moderne' },
    { id: 4, image: '🏨', title: 'Hôtel boutique', description: 'Design d\'intérieur pour un hôtel de charme' }
  ]

  const reviews = [
    { id: 1, author: 'Sophie M.', rating: 5, date: 'Il y a 2 semaines', text: 'Excellent travail ! Marie a transformé mon appartement avec goût et professionnalisme.' },
    { id: 2, author: 'Pierre K.', rating: 5, date: 'Il y a 1 mois', text: 'Très satisfait du résultat. Design moderne et fonctionnel, exactement ce que je voulais.' },
    { id: 3, author: 'Aicha D.', rating: 4, date: 'Il y a 2 mois', text: 'Bonne expérience globale, quelques retards mineurs mais résultat final parfait.' }
  ]

  return (
    <ScreenLayout showBack showBottomNav>
      <div className="professional-profile">
        <div className="image-carousel">
          <div className="carousel-image">🏠</div>
          <div className="carousel-image">🏠</div>
        </div>
        <div className="prof-header">
          <h2>Marie Dubois</h2>
          <p className="prof-title">Interior Designer • Verified</p>
          <div className="rating-section">
            <div className="rating-main">
              <span className="rating-number">4.8</span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < 4 ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            À propos
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button 
            className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Réalisations
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Avis
          </button>
        </div>

        {activeTab === 'about' && (
          <div className="about-section">
            <p>
              Experienced interior designer with over 10 years of expertise in creating beautiful and functional spaces.
              Specialized in modern and contemporary designs.
            </p>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            {services.map((service) => (
              <div key={service.id} className="service-item">
                <div className="service-info">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <p className="service-price">{service.price}</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/services/select')}>
                  Voir
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            <div className="portfolio-grid">
              {portfolio.map((item) => (
                <div key={item.id} className="portfolio-item">
                  <div className="portfolio-image">{item.image}</div>
                  <h4 className="portfolio-title">{item.title}</h4>
                  <p className="portfolio-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-author-info">
                    <span className="review-author">{review.author}</span>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="availability-section">
          <h3>Disponibilité</h3>
          <div className="calendar-preview">
            <Calendar size={20} />
            <span>July 2024</span>
          </div>
          <div className="calendar-grid">
            {[...Array(31)].map((_, i) => (
              <div key={i} className={`calendar-day ${i === 4 ? 'selected' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="action-buttons">
          <Button variant="outline" fullWidth>Contacter</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/services/select')}>
            Réserver
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalProfile

