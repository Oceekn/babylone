import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, Calendar, MapPin, MessageCircle } from 'lucide-react'
import { professionalsService, Professional } from '../../services/professionals.service'
import { servicesService, Service } from '../../services/services.service'
import { chatService } from '../../services/chat.service'
import { api } from '../../services/api'
import { Booking } from '../../services/bookings.service'
import './ProfessionalProfile.css'

const ProfessionalProfile = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'portfolio' | 'reviews'>('about')
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadProfessionalData()
    }
  }, [id])

  const loadProfessionalData = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Charger le professionnel
      const profData = await professionalsService.getById(id)
      setProfessional(profData)

      // Charger les services
      const servicesData = await servicesService.getByProfessional(id)
      setServices(servicesData)

      // Charger les avis reels
      try {
        const reviewsData = await api.get<Booking[]>(`/bookings/professional/${id}/reviews`)
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      } catch {
        setReviews([])
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du professionnel:', err)
      setError('Erreur lors du chargement des donnees')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'XAF') => {
    return `${price.toLocaleString('fr-FR')} ${currency}`
  }

  const getUserName = (prof: Professional) => {
    if (prof.user) {
      return `${prof.user.first_name || ''} ${prof.user.last_name || ''}`.trim() || prof.business_name || 'Professionnel'
    }
    return prof.business_name || 'Professionnel'
  }

  // Portfolio = services avec images
  const portfolio = services
    .filter(s => s.image_url)
    .map(s => ({ id: s.id, image: s.image_url!, title: s.title, description: s.description || '' }))

  const formatReviewDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
    return `Il y a ${Math.floor(diffDays / 365)} ans`
  }

  return (
    <ScreenLayout showBack showBottomNav>
      <div className="professional-profile">
        <div className="image-carousel">
          {professional?.user?.avatar_url ? (
            <div className="carousel-image">
              <img src={professional.user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="carousel-image carousel-placeholder">
              <span>{professional ? getUserName(professional).charAt(0).toUpperCase() : 'P'}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
            <p>{error}</p>
            <Button variant="outline" onClick={loadProfessionalData} style={{ marginTop: '10px' }}>
              Réessayer
            </Button>
          </div>
        ) : professional ? (
          <>
            <div className="prof-header">
              <h2>{getUserName(professional)}</h2>
              <p className="prof-title">
                {professional.profession || 'Professionnel'}
                {professional.is_verified && ' • Vérifié'}
              </p>
              <div className="rating-section">
                <div className="rating-main">
                  <span className="rating-number">{professional.rating?.toFixed(1) || '0.0'}</span>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={20} 
                        fill={i < Math.floor(professional.rating || 0) ? 'currentColor' : 'none'} 
                      />
                    ))}
                  </div>
                  <span>({professional.total_reviews || 0} avis)</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
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

        {activeTab === 'about' && professional && (
          <div className="about-section">
            <p>{professional.description || 'Aucune description disponible'}</p>
            {professional.address && (
              <p style={{ marginTop: '10px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {professional.address}{professional.city ? `, ${professional.city}` : ''}
              </p>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="service-item">
                  <div className="service-info">
                    <h3 className="service-name">{service.title}</h3>
                    {service.description && (
                      <p className="service-description">{service.description}</p>
                    )}
                    <p className="service-price">
                      {formatPrice(Number(service.price), service.currency)}
                      {service.estimated_duration && ` • ~${service.estimated_duration} min`}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    localStorage.setItem('bookingFlow_professionalId', id || '')
                    localStorage.setItem('bookingFlow_professionalName', getUserName(professional!))
                    navigate(`/services/select?professionalId=${id}&serviceId=${service.id}`)
                  }}>
                    Voir
                  </Button>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Aucun service disponible</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            {portfolio.length > 0 ? (
              <div className="portfolio-grid">
                {portfolio.map((item) => (
                  <div key={item.id} className="portfolio-item">
                    <div className="portfolio-image">
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                    <h4 className="portfolio-title">{item.title}</h4>
                    {item.description && <p className="portfolio-description">{item.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                <p>Aucune realisation a afficher pour le moment</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            {reviews.length > 0 ? (
              reviews.map((review) => {
                const authorName = review.client
                  ? `${review.client.first_name || ''} ${review.client.last_name || ''}`.trim() || 'Client'
                  : 'Client'
                return (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-author-info">
                        <span className="review-author">{authorName}</span>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{formatReviewDate(review.updated_at)}</span>
                    </div>
                    {review.review && <p className="review-text">{review.review}</p>}
                    {review.service && (
                      <p className="review-service" style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                        Service : {review.service.title}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                <p>Aucun avis pour le moment</p>
              </div>
            )}
          </div>
        )}
        <div className="availability-section">
          <h3>Disponibilite</h3>
          <div className="calendar-preview">
            <Calendar size={20} />
            <span>
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="calendar-grid">
            {[...Array(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate())].map((_, i) => {
              const today = new Date().getDate()
              return (
                <div key={i} className={`calendar-day ${i + 1 === today ? 'selected' : ''} ${i + 1 < today ? 'past' : ''}`}>
                  {i + 1}
                </div>
              )
            })}
          </div>
        </div>
        <div className="action-buttons">
          <Button variant="outline" fullWidth onClick={async () => {
            if (!professional?.user_id) return
            try {
              const conversation = await chatService.createIndividualConversation(professional.user_id)
              navigate(`/messages/chat/${conversation.id}`)
            } catch (err) {
              console.error('Erreur creation conversation:', err)
              navigate('/messages')
            }
          }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <MessageCircle size={18} /> Contacter
            </span>
          </Button>
          <Button variant="secondary" fullWidth onClick={() => {
            if (id && professional) {
              localStorage.setItem('bookingFlow_professionalId', id)
              localStorage.setItem('bookingFlow_professionalName', getUserName(professional))
            }
            navigate(`/services/select?professionalId=${id}`)
          }}>
            Reserver
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalProfile

