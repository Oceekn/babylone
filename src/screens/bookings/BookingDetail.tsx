import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, MapPin, Clock, Calendar } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './BookingDetail.css'

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  in_progress: 'En cours',
  completed: 'Terminee',
  cancelled: 'Annulee',
  rejected: 'Refusee',
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadBooking()
  }, [id])

  const loadBooking = async () => {
    try {
      setLoading(true)
      const data = await bookingsService.getById(id!)
      setBooking(data)
    } catch (err) {
      console.error('Erreur chargement reservation:', err)
      setError('Impossible de charger la reservation')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    setActionLoading(true)
    try {
      const updated = await bookingsService.updateStatus(booking.id, 'cancelled')
      setBooking(updated)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReview = async () => {
    if (!booking || rating === 0) return
    setActionLoading(true)
    try {
      const updated = await bookingsService.addReview(booking.id, rating, reviewText || undefined)
      setBooking(updated)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getProfessionalName = (b: Booking) => {
    if (b.professional?.user) {
      const u = b.professional.user
      return `${u.first_name || ''} ${u.last_name || ''}`.trim() || b.professional.business_name || 'Professionnel'
    }
    return b.professional?.business_name || 'Professionnel'
  }

  if (loading) {
    return (
      <ScreenLayout title="Details" showBack showBottomNav>
        <p style={{ padding: '20px', textAlign: 'center' }}>Chargement...</p>
      </ScreenLayout>
    )
  }

  if (!booking) {
    return (
      <ScreenLayout title="Details" showBack showBottomNav>
        <p style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
          {error || 'Reservation introuvable'}
        </p>
      </ScreenLayout>
    )
  }

  const canCancel = ['pending', 'confirmed'].includes(booking.status)
  const canReview = booking.status === 'completed' && !booking.rating

  return (
    <ScreenLayout title="Details de la reservation" showBack showBottomNav>
      <div className="booking-detail">
        <div className="professional-header">
          <div className="prof-avatar">
            {booking.professional?.user?.avatar_url ? (
              <img src={booking.professional.user.avatar_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{getProfessionalName(booking).charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="prof-info">
            <h3>{getProfessionalName(booking)}</h3>
            {booking.professional?.profession && (
              <p style={{ color: '#666', fontSize: '14px' }}>{booking.professional.profession}</p>
            )}
          </div>
          <span className={`booking-status-badge status-${booking.status}`}>
            {STATUS_LABELS[booking.status] || booking.status}
          </span>
        </div>

        <div className="booking-sections">
          {booking.service && (
            <div className="section">
              <p className="section-label">Service</p>
              <p className="section-value">{booking.service.title}</p>
            </div>
          )}

          <div className="section">
            <p className="section-label"><Calendar size={14} style={{ marginRight: 6 }} />Date et heure</p>
            <p className="section-value">{formatDate(booking.scheduled_at)}</p>
          </div>

          {booking.duration_minutes && (
            <div className="section">
              <p className="section-label"><Clock size={14} style={{ marginRight: 6 }} />Duree</p>
              <p className="section-value">
                {booking.duration_minutes >= 60
                  ? `${Math.floor(booking.duration_minutes / 60)}h${booking.duration_minutes % 60 > 0 ? booking.duration_minutes % 60 + 'min' : ''}`
                  : `${booking.duration_minutes} min`}
              </p>
            </div>
          )}

          {booking.address && (
            <div className="section">
              <p className="section-label"><MapPin size={14} style={{ marginRight: 6 }} />Lieu</p>
              <p className="section-value">{booking.address}</p>
            </div>
          )}

          {booking.price && (
            <div className="section">
              <p className="section-label">Prix</p>
              <p className="section-value" style={{ fontWeight: 700, fontSize: '18px', color: '#FF3131' }}>
                {booking.price} {booking.currency}
              </p>
            </div>
          )}

          {booking.notes && (
            <div className="section">
              <p className="section-label">Notes</p>
              <p className="section-value">{booking.notes}</p>
            </div>
          )}

          {booking.cancellation_reason && (
            <div className="section">
              <p className="section-label">Raison d'annulation</p>
              <p className="section-value" style={{ color: '#FF3131' }}>{booking.cancellation_reason}</p>
            </div>
          )}

          {booking.rating && (
            <div className="section">
              <p className="section-label">Votre avis</p>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} fill={s <= booking.rating! ? '#FFB800' : 'none'} color={s <= booking.rating! ? '#FFB800' : '#ccc'} />
                ))}
              </div>
              {booking.review && <p className="section-value">{booking.review}</p>}
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: '#FF3131', textAlign: 'center', marginBottom: '12px', fontSize: '14px' }}>{error}</p>
        )}

        {canReview && (
          <div className="review-section">
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Laisser un avis</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Star size={28} fill={s <= rating ? '#FFB800' : 'none'} color={s <= rating ? '#FFB800' : '#ccc'} />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Votre commentaire (optionnel)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' }}
            />
            <Button variant="primary" fullWidth onClick={handleReview} disabled={rating === 0 || actionLoading}>
              {actionLoading ? 'Envoi...' : 'Envoyer l\'avis'}
            </Button>
          </div>
        )}

        <div className="booking-actions">
          {['confirmed', 'in_progress'].includes(booking.status) && (
            <Button variant="primary" fullWidth onClick={() => navigate(`/bookings/${booking.id}/tracking`)}>
              Suivi en direct
            </Button>
          )}
          {canCancel && (
            <>
              <Button variant="outline" fullWidth onClick={() => navigate(`/bookings/${booking.id}/reschedule`)}>
                Reporter la reservation
              </Button>
              <Button variant="secondary" fullWidth onClick={handleCancel} disabled={actionLoading}>
                {actionLoading ? 'Annulation...' : 'Annuler la reservation'}
              </Button>
            </>
          )}
          <Button variant="outline" fullWidth onClick={() => navigate('/bookings')}>
            Retour aux reservations
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default BookingDetail
