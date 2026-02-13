import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Phone, MessageCircle, MapPin, Clock, Loader, CheckCircle } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import { chatService } from '../../services/chat.service'
import './ActiveBookingTracking.css'

const statusLabels: Record<string, string> = {
  pending: 'En attente de confirmation',
  confirmed: 'Confirme - En attente du service',
  in_progress: 'Service en cours',
  completed: 'Service termine',
  cancelled: 'Annule',
  rejected: 'Refuse',
}

const ActiveBookingTracking = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadBooking()
  }, [id])

  // Polling pour mise a jour en temps reel
  useEffect(() => {
    if (!id) return
    const interval = setInterval(() => {
      loadBooking(true)
    }, 10000) // toutes les 10 secondes
    return () => clearInterval(interval)
  }, [id])

  const loadBooking = async (silent = false) => {
    if (!id) return
    try {
      if (!silent) setLoading(true)
      const data = await bookingsService.getById(id)
      setBooking(data)
      setError(null)
    } catch (err: any) {
      if (!silent) {
        setError('Impossible de charger la reservation')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const getProfName = (b: Booking) => {
    if (b.professional?.user) {
      return `${b.professional.user.first_name || ''} ${b.professional.user.last_name || ''}`.trim()
    }
    return b.professional?.business_name || 'Professionnel'
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in_progress': return 'active'
      case 'completed': return 'completed'
      case 'confirmed': return 'confirmed'
      case 'cancelled':
      case 'rejected': return 'cancelled'
      default: return 'pending'
    }
  }

  const steps = [
    { key: 'pending', label: 'Reservation envoyee' },
    { key: 'confirmed', label: 'Confirmee par le pro' },
    { key: 'in_progress', label: 'Service en cours' },
    { key: 'completed', label: 'Termine' },
  ]

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex(s => s.key === status)
    return idx >= 0 ? idx : 0
  }

  if (loading) {
    return (
      <ScreenLayout title="Suivi" showBack showBottomNav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (error || !booking) {
    return (
      <ScreenLayout title="Suivi" showBack showBottomNav>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{error || 'Reservation introuvable'}</p>
          <Button variant="outline" onClick={() => navigate('/bookings')}>Mes reservations</Button>
        </div>
      </ScreenLayout>
    )
  }

  const currentStep = getStepIndex(booking.status)

  return (
    <ScreenLayout title="Suivi du service" showBack showBottomNav>
      <div className="active-booking-tracking">
        <div className="tracking-header">
          <div className={`status-banner ${getStatusClass(booking.status)}`}>
            {statusLabels[booking.status] || booking.status}
          </div>
        </div>

        <div className="progress-steps">
          {steps.map((step, i) => (
            <div key={step.key} className={`step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
              <div className="step-dot">
                {i < currentStep ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="booking-info-card">
          <h3>{booking.service?.title || 'Service'}</h3>
          <div className="info-row">
            <Clock size={16} />
            <span>
              {new Date(booking.scheduled_at).toLocaleDateString('fr-FR', {
                weekday: 'short', day: 'numeric', month: 'short'
              })}
              {' a '}
              {new Date(booking.scheduled_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          {booking.address && (
            <div className="info-row">
              <MapPin size={16} />
              <span>{booking.address}</span>
            </div>
          )}
          <div className="professional-row">
            <div className="pro-avatar">
              {booking.professional?.user?.avatar_url ? (
                <img src={booking.professional.user.avatar_url} alt="" />
              ) : (
                <span>{getProfName(booking).charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="pro-name">{getProfName(booking)}</p>
              <p className="pro-profession">{booking.professional?.profession || ''}</p>
            </div>
          </div>
        </div>

        <div className="tracking-actions">
          {booking.status === 'completed' && !booking.rating && (
            <Button variant="secondary" fullWidth onClick={() => navigate(`/bookings/${booking.id}/review`)}>
              Laisser un avis
            </Button>
          )}
          <div className="contact-actions">
            <button className="action-icon" title="Appeler" onClick={() => {
              const phone = booking?.professional?.user?.telephone
              if (phone) window.open(`tel:${phone}`)
            }}>
              <Phone size={20} />
            </button>
            <button className="action-icon" title="Message" onClick={async () => {
              const userId = booking?.professional?.user?.id || booking?.professional?.user_id
              if (!userId) return
              try {
                const conv = await chatService.createIndividualConversation(userId)
                navigate(`/messages/chat/${conv.id}`)
              } catch {
                navigate('/messages')
              }
            }}>
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ActiveBookingTracking
