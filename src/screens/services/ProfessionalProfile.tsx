import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfilePhotoViewer from '../../components/common/ProfilePhotoViewer'
import Button from '../../components/common/Button'
import { Star, Calendar, MapPin, MessageCircle, Heart, Share2 } from 'lucide-react'
import { professionalsService, Professional } from '../../services/professionals.service'
import { servicesService, Service } from '../../services/services.service'
import { chatService } from '../../services/chat.service'
import { DM_PRIVACY_BLOCKED_MESSAGE_FR, isDmPrivacyBlocked } from '../../utils/chatPrivacy'
import { api } from '../../services/api'
import { Booking } from '../../services/bookings.service'
import { socialService, Post, POST_METADATA_SCOPE_REALIZATION } from '../../services/social.service'
import { formatTimeAgo } from '../../utils/date'
import './ProfessionalProfile.css'

const ProfessionalProfile = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'portfolio' | 'reviews'>('services')
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPhotoViewer, setShowPhotoViewer] = useState(false)
  const [contactPrivacyError, setContactPrivacyError] = useState<string | null>(null)
  const [realizationPosts, setRealizationPosts] = useState<Post[]>([])
  const [realizationsLoading, setRealizationsLoading] = useState(false)
  const [realizationsError, setRealizationsError] = useState<string | null>(null)
  const [likedRealizations, setLikedRealizations] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (id) {
      loadProfessionalData()
    } else {
      setLoading(false)
      setError('Profil introuvable')
    }
  }, [id])

  useEffect(() => {
    const uid = professional?.user_id
    if (!uid || activeTab !== 'portfolio') return

    let cancelled = false
    const load = async () => {
      setRealizationsLoading(true)
      setRealizationsError(null)
      try {
        const list = await socialService.getUserPosts(uid, POST_METADATA_SCOPE_REALIZATION)
        if (!cancelled) setRealizationPosts(Array.isArray(list) ? list : [])
      } catch (e) {
        console.error('Réalisations:', e)
        if (!cancelled) {
          setRealizationPosts([])
          setRealizationsError('Impossible de charger les réalisations.')
        }
      } finally {
        if (!cancelled) setRealizationsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [professional?.user_id, activeTab])

  const loadProfessionalData = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Charger le professionnel
      const profData = await professionalsService.getById(id)
      setProfessional(profData)

      // Charger les services (affichés au client pour réservation)
      const servicesData = await servicesService.getByProfessional(id)
      setServices(Array.isArray(servicesData) ? servicesData : [])

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

  const postAuthorLabel = (post: Post) => {
    if (post.user) {
      return `${post.user.first_name || ''} ${post.user.last_name || ''}`.trim() || 'Professionnel'
    }
    return professional ? getUserName(professional) : 'Professionnel'
  }

  const handleRealizationLike = async (postId: string) => {
    try {
      const response = await socialService.toggleLike(postId) as {
        liked: boolean
        likes_count?: number
        likesCount?: number
      }
      const count = response.likes_count ?? response.likesCount ?? 0
      setRealizationPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes_count: count } : p)),
      )
      setLikedRealizations((prev) => {
        const next = new Set(prev)
        if (response.liked) next.add(postId)
        else next.delete(postId)
        return next
      })
    } catch (err) {
      console.error('Like réalisation:', err)
    }
  }

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
        <div
          className="image-carousel"
          role={professional?.user?.avatar_url ? 'button' : undefined}
          aria-label={professional?.user?.avatar_url ? 'Voir la photo de profil' : undefined}
          style={{ cursor: professional?.user?.avatar_url ? 'pointer' : undefined }}
          onClick={() => professional?.user?.avatar_url && setShowPhotoViewer(true)}
        >
          {professional?.user?.avatar_url ? (
            <div className="carousel-image">
              <img
                src={professional.user.avatar_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const placeholder = target.closest('.carousel-image')?.nextElementSibling
                  if (placeholder instanceof HTMLElement) placeholder.style.display = 'flex'
                }}
              />
            </div>
          ) : null}
          <div className="carousel-image carousel-placeholder" style={{ display: professional?.user?.avatar_url ? 'none' : 'flex' }}>
            <span>{professional ? getUserName(professional).charAt(0).toUpperCase() : 'P'}</span>
          </div>
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
                  <span className="rating-number">{(Number(professional.rating) || 0).toFixed(1)}</span>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={20} 
                        fill={i < Math.floor(Number(professional.rating) || 0) ? 'currentColor' : 'none'} 
                      />
                    ))}
                  </div>
                  <span>({Number(professional.total_reviews) || 0} avis)</span>
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
                    localStorage.setItem('bookingFlow_professionalName', professional ? getUserName(professional) : 'Professionnel')
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
          <div className="portfolio-section realization-feed">
            {realizationsLoading && realizationPosts.length === 0 ? (
              <div className="realization-feed-status">Chargement...</div>
            ) : realizationsError && realizationPosts.length === 0 ? (
              <div className="realization-feed-status realization-feed-error">{realizationsError}</div>
            ) : realizationPosts.length > 0 ? (
              realizationPosts.map((post) => {
                const videoUrl = post.video_url ?? (post as { videoUrl?: string }).videoUrl
                return (
                  <article key={post.id} className="realization-post-card">
                    {videoUrl && (
                      <video src={videoUrl} controls playsInline className="realization-post-media" />
                    )}
                    {post.image_url && !videoUrl && (
                      <img src={post.image_url} alt="" className="realization-post-media" />
                    )}
                    <div className="realization-post-body">
                      <div className="realization-post-meta">
                        <span className="realization-post-author">{postAuthorLabel(post)}</span>
                        <span className="realization-post-time">{formatTimeAgo(post.created_at)}</span>
                      </div>
                      {post.content && <p className="realization-post-text">{post.content}</p>}
                      <div className="realization-post-actions">
                        <button
                          type="button"
                          className="realization-action-btn"
                          onClick={() => handleRealizationLike(post.id)}
                          aria-label="J’aime"
                        >
                          <Heart
                            size={18}
                            fill={likedRealizations.has(post.id) ? '#FF3131' : 'none'}
                            color={likedRealizations.has(post.id) ? '#FF3131' : 'currentColor'}
                          />
                          <span>{post.likes_count ?? 0}</span>
                        </button>
                        <button
                          type="button"
                          className="realization-action-btn"
                          onClick={() => navigate(`/social/post/${post.id}`)}
                        >
                          <MessageCircle size={18} />
                          <span>{post.comments_count ?? 0}</span>
                        </button>
                        <button
                          type="button"
                          className="realization-action-btn"
                          onClick={() => {
                            if (navigator.share) {
                              void navigator.share({
                                title: postAuthorLabel(post),
                                text: post.content || '',
                                url: `${window.location.origin}/social/post/${post.id}`,
                              })
                            }
                          }}
                        >
                          <Share2 size={18} />
                          <span>{post.shares_count ?? 0}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="realization-feed-status">
                <p>Aucune réalisation publiée pour le moment.</p>
                <p className="realization-feed-hint">Le professionnel partage ici ses travaux ; vous pouvez aimer et commenter comme sur le fil social.</p>
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
                            <Star key={i} size={14} fill={i < (Number(review.rating) || 0) ? 'currentColor' : 'none'} />
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
        {contactPrivacyError && (
          <p style={{ color: '#c62828', fontSize: 13, margin: '0 0 12px', padding: '0 4px' }}>{contactPrivacyError}</p>
        )}
        <div className="action-buttons">
          <Button variant="outline" fullWidth onClick={async () => {
            if (!professional?.user_id) return
            setContactPrivacyError(null)
            try {
              const conversation = await chatService.createIndividualConversation(professional.user_id)
              navigate(`/messages/chat/${conversation.id}`)
            } catch (err) {
              console.error('Erreur creation conversation:', err)
              if (isDmPrivacyBlocked(err)) {
                setContactPrivacyError(DM_PRIVACY_BLOCKED_MESSAGE_FR)
              } else {
                navigate('/messages')
              }
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
      {professional?.user?.avatar_url && (
        <ProfilePhotoViewer
          imageUrl={professional.user.avatar_url}
          isOpen={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          alt={professional ? getUserName(professional) : 'Photo de profil'}
        />
      )}
    </ScreenLayout>
  )
}

export default ProfessionalProfile

