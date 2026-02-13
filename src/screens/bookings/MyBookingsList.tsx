import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { bookingsService, Booking } from '../../services/bookings.service'
import './MyBookingsList.css'

const STATUS_TABS = [
  { key: '', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmees' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminees' },
  { key: 'cancelled', label: 'Annulees' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  in_progress: 'En cours',
  completed: 'Terminee',
  cancelled: 'Annulee',
  rejected: 'Refusee',
}

const MyBookingsList = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bookingsService.getMyBookings(activeTab || undefined)
      setBookings(data)
    } catch (err) {
      console.error('Erreur chargement reservations:', err)
      setError('Impossible de charger les reservations')
    } finally {
      setLoading(false)
    }
  }

  const getProfessionalName = (booking: Booking) => {
    if (booking.professional?.user) {
      const u = booking.professional.user
      return `${u.first_name || ''} ${u.last_name || ''}`.trim() || booking.professional.business_name || 'Professionnel'
    }
    return booking.professional?.business_name || 'Professionnel'
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ScreenLayout title="Mes reservations" showBack showBottomNav>
      <div className="my-bookings">
        <div className="booking-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Chargement...</p>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#FF3131', marginBottom: '12px' }}>{error}</p>
            <Button variant="outline" onClick={loadBookings}>Reessayer</Button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Aucune reservation</p>
            <p style={{ fontSize: '14px' }}>Vos reservations apparaitront ici</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="booking-card"
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                <div className="booking-info">
                  <span className={`booking-status status-${booking.status}`}>
                    {STATUS_LABELS[booking.status] || booking.status}
                  </span>
                  <h3>{getProfessionalName(booking)}</h3>
                  <p>{booking.service?.title || 'Service'}</p>
                  <p className="booking-date">{formatDate(booking.scheduled_at)}</p>
                  {booking.price && (
                    <p className="booking-price">{booking.price} {booking.currency}</p>
                  )}
                </div>
                <div className="booking-avatar">
                  {booking.professional?.user?.avatar_url ? (
                    <img src={booking.professional.user.avatar_url} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{getProfessionalName(booking).charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default MyBookingsList
