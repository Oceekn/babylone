import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, Loader, CheckCircle } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './RateReview.css'

const RateReview = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    if (id) loadBooking()
  }, [id])

  const loadBooking = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await bookingsService.getById(id)
      setBooking(data)
      if (data.rating) {
        setRating(data.rating)
        setReview(data.review || '')
        setSubmitted(true)
      }
    } catch (err) {
      setError('Impossible de charger la reservation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!id || rating === 0 || submitting) return
    try {
      setSubmitting(true)
      setError(null)
      await bookingsService.addReview(id, rating, review || undefined)
      setSubmitted(true)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const getProfName = (b: Booking) => {
    if (b.professional?.user) {
      return `${b.professional.user.first_name || ''} ${b.professional.user.last_name || ''}`.trim()
    }
    return b.professional?.business_name || 'Professionnel'
  }

  if (loading) {
    return (
      <ScreenLayout title="Avis" showBack>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (!booking) {
    return (
      <ScreenLayout title="Avis" showBack>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{error || 'Reservation introuvable'}</p>
          <Button variant="outline" onClick={() => navigate('/bookings')}>Mes reservations</Button>
        </div>
      </ScreenLayout>
    )
  }

  if (submitted) {
    return (
      <ScreenLayout title="Avis" showBack>
        <div className="rate-review">
          <div className="submitted-state">
            <CheckCircle size={48} color="#4CAF50" />
            <h2>Merci pour votre avis !</h2>
            <div className="stars-large">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={32} fill={i <= rating ? '#FFB800' : 'none'} color="#FFB800" />
              ))}
            </div>
            {review && <p className="submitted-review">"{review}"</p>}
            <Button variant="secondary" fullWidth onClick={() => navigate('/bookings')}>
              Mes reservations
            </Button>
          </div>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Laisser un avis" showBack>
      <div className="rate-review">
        <div className="review-header">
          <div className="review-avatar">
            {booking.professional?.user?.avatar_url ? (
              <img src={booking.professional.user.avatar_url} alt="" />
            ) : (
              <span>{getProfName(booking).charAt(0)}</span>
            )}
          </div>
          <div>
            <h3>{getProfName(booking)}</h3>
            <p>{booking.service?.title || booking.professional?.profession || ''}</p>
          </div>
        </div>

        <div className="rating-section">
          <p className="rating-label">Quelle note donnez-vous ?</p>
          <div className="stars-large">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={40}
                fill={(hoverRating || rating) >= i ? '#FFB800' : 'none'}
                color="#FFB800"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
              />
            ))}
          </div>
          {rating > 0 && (
            <p className="rating-text">
              {rating === 1 ? 'Mauvais' : rating === 2 ? 'Moyen' : rating === 3 ? 'Bien' : rating === 4 ? 'Tres bien' : 'Excellent'}
            </p>
          )}
        </div>

        <div className="review-input-section">
          <label>Votre commentaire (optionnel)</label>
          <textarea
            className="review-textarea"
            placeholder="Decrivez votre experience..."
            rows={5}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        {error && (
          <div className="review-error">
            <p>{error}</p>
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader size={16} className="spin" /> Envoi...
            </span>
          ) : (
            'Envoyer l\'avis'
          )}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default RateReview
