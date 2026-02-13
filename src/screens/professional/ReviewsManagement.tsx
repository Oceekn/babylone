import { useState, useEffect } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Star, Loader } from 'lucide-react'
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

  return (
    <ScreenLayout title="Avis" showBack showBottomNav>
      <div className="reviews-management">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : (
          <>
            <div className="overall-rating">
              <div className="rating-display">
                <span className="rating-number">{avgRating.toFixed(1)}</span>
                <div className="stars-large">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={24} fill={i <= Math.round(avgRating) ? '#FFB800' : 'none'} color="#FFB800" />
                  ))}
                </div>
                <p>{reviews.length} avis</p>
              </div>
              <div className="rating-breakdown">
                {ratingDistribution.map(({ star, percent }) => (
                  <div key={star} className="breakdown-bar">
                    <span>{star}</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span>{percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-buttons">
              <button className={`filter-btn ${filter === null ? 'active' : ''}`} onClick={() => setFilter(null)}>Tout</button>
              {[5, 4, 3, 2, 1].map(s => (
                <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s} <Star size={12} fill="currentColor" /></button>
              ))}
            </div>

            <div className="reviews-list">
              {filteredReviews.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Aucun avis</p>
              ) : (
                filteredReviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <div className="review-avatar">
                      {r.client?.avatar_url ? (
                        <img src={r.client.avatar_url} alt="" />
                      ) : (
                        getClientName(r).charAt(0)
                      )}
                    </div>
                    <div className="review-content">
                      <div className="review-header">
                        <span className="review-author">{getClientName(r)}</span>
                        <div className="review-stars">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} fill={i <= (r.rating || 0) ? '#FFB800' : 'none'} color="#FFB800" />
                          ))}
                        </div>
                      </div>
                      <p className="review-service">{r.service?.title || ''}</p>
                      {r.review && <p className="review-text">{r.review}</p>}
                      <p className="review-date">{new Date(r.updated_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
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
