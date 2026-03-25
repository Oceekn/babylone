import { useState, useEffect } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import { Star, Loader, MessageCircle } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './ReviewsManagement.css'

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<number | null>(null)

  useEffect(() => { loadReviews() }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await bookingsService.getReviewsReceived()
      setReviews(data)
    } catch (err) {
      console.error('Erreur chargement avis:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = filter ? reviews.filter(r => Math.round(r.rating || 0) === filter) : reviews

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating || 0) === star).length,
    percent: reviews.length > 0
      ? Math.round(reviews.filter(r => Math.round(r.rating || 0) === star).length / reviews.length * 100)
      : 0,
  }))

  const getClientName = (b: Booking) => {
    if (b.client) return `${b.client.first_name || ''} ${b.client.last_name || ''}`.trim() || 'Client'
    return 'Client'
  }

  const hasRating = avgRating > 0

  return (
    <ScreenLayout title="Avis" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
      <div className="reviews-management">
        {loading ? (
          <div className="reviews-loading">
            <Loader size={32} className="spin" />
          </div>
        ) : (
          <>
            <section className="reviews-summary-card">
              <div className="rating-display">
                <span className="rating-number">{avgRating.toFixed(1)}</span>
                <div className="stars-large" aria-hidden>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={26}
                      fill={hasRating && i <= Math.round(avgRating) ? '#FFB800' : 'none'}
                      color={hasRating ? '#FFB800' : '#cbd5e1'}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="rating-count">{reviews.length} avis</p>
              </div>
              <div className="rating-breakdown">
                {ratingDistribution.map(({ star, count, percent }) => (
                  <div key={star} className="breakdown-row">
                    <span className="breakdown-star">{star}</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="breakdown-value">{reviews.length > 0 ? `${count} (${percent}%)` : '0%'}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="filter-buttons">
              <button type="button" className={`filter-btn ${filter === null ? 'active' : ''}`} onClick={() => setFilter(null)}>
                Tout
              </button>
              {[5, 4, 3, 2, 1].map(s => (
                <button key={s} type="button" className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                  {s} <Star size={12} fill="currentColor" />
                </button>
              ))}
            </div>

            <div className="reviews-list">
              {filteredReviews.length === 0 ? (
                <div className="reviews-empty">
                  <div className="reviews-empty-icon">
                    <MessageCircle size={40} strokeWidth={1.5} />
                  </div>
                  <p className="reviews-empty-title">Aucun avis</p>
                  <p className="reviews-empty-text">
                    {reviews.length === 0
                      ? 'Les avis apparaîtront ici une fois que vos clients auront noté leurs réservations.'
                      : `Aucun avis à ${filter} étoile${filter === 1 ? '' : 's'} pour le moment.`}
                  </p>
                </div>
              ) : (
                filteredReviews.map((r) => (
                  <article key={r.id} className="review-item">
                    <div className="review-avatar" aria-hidden>
                      {r.client?.avatar_url ? (
                        <img
                          src={r.client.avatar_url}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling
                            if (fallback) (fallback as HTMLElement).style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <span className="review-initial" style={r.client?.avatar_url ? { display: 'none' } : undefined}>
                        {getClientName(r).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="review-content">
                      <div className="review-header">
                        <span className="review-author">{getClientName(r)}</span>
                        <div className="review-stars" aria-label={`${r.rating || 0} sur 5`}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} fill={i <= (r.rating || 0) ? '#FFB800' : 'none'} color="#FFB800" strokeWidth={1.5} />
                          ))}
                        </div>
                      </div>
                      {r.service?.title && <p className="review-service">{r.service.title}</p>}
                      {r.review && <p className="review-text">{r.review}</p>}
                      <time className="review-date" dateTime={r.updated_at}>
                        {new Date(r.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </time>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default ReviewsManagement
