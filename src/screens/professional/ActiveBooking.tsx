import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { MapPin, Phone, MessageCircle, Clock, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import { chatService } from '../../services/chat.service'
import './ActiveBooking.css'

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  in_progress: 'En cours',
  completed: 'Terminee',
  cancelled: 'Annulee',
  rejected: 'Refusee',
}

const ActiveBooking = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => { if (id) loadBooking() }, [id])

  const loadBooking = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await bookingsService.getById(id)
      setBooking(data)
    } catch (err) {
      setError('Reservation introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!id || actionLoading) return
    try {
      setActionLoading(true)
      setActionError(null)
      const updated = await bookingsService.updateStatus(id, newStatus)
      setBooking(updated)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la mise a jour'
      setActionError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setActionLoading(false)
    }
  }

  const getClientName = (b: Booking) => {
    if (b.client) return `${b.client.first_name || ''} ${b.client.last_name || ''}`.trim() || 'Client'
    return 'Client'
  }

  if (loading) {
    return (
      <ScreenLayout title="Reservation" showBack showBottomNav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (error || !booking) {
    return (
      <ScreenLayout title="Reservation" showBack showBottomNav>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{error || 'Reservation introuvable'}</p>
          <Button variant="outline" onClick={() => navigate('/professional/bookings')}>Retour</Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Reservation active" showBack showBottomNav>
      <div className="active-booking">
        <div className={`status-badge ${booking.status}`}>
          {statusLabels[booking.status] || booking.status}
        </div>

        <div className="client-info-card">
          <div className="client-avatar">
            {booking.client?.avatar_url ? (
              <img src={booking.client.avatar_url} alt="" />
            ) : (
              getClientName(booking).charAt(0)
            )}
          </div>
          <div className="client-details">
            <h3>{getClientName(booking)}</h3>
            {booking.client?.telephone && <p>{booking.client.telephone}</p>}
          </div>
        </div>

        <div className="service-details-grid">
          <div className="detail-box">
            <p className="detail-label">Service</p>
            <p className="detail-value">{booking.service?.title || '-'}</p>
          </div>
          <div className="detail-box">
            <p className="detail-label">Date</p>
            <p className="detail-value">
              {new Date(booking.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="detail-box">
            <p className="detail-label">Heure</p>
            <p className="detail-value">
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {new Date(booking.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {booking.price && (
            <div className="detail-box">
              <p className="detail-label">Prix</p>
              <p className="detail-value">{Number(booking.price).toLocaleString('fr-FR')} FCFA</p>
            </div>
          )}
        </div>

        {booking.address && (
          <div className="location-section">
            <MapPin size={20} />
            <span>{booking.address}</span>
          </div>
        )}

        {booking.notes && (
          <div className="notes-section">
            <h3>Notes</h3>
            <p>{booking.notes}</p>
          </div>
        )}

        <div className="actions-section">
          <h3>Actions</h3>
          {actionError && (
            <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#D32F2F', fontSize: '13px' }}>
              {actionError}
            </div>
          )}
          <div className="action-buttons">
            {booking.status === 'pending' && (
              <>
                <Button variant="primary" fullWidth onClick={() => handleStatusChange('confirmed')} disabled={actionLoading}>
                  Confirmer
                </Button>
                <Button variant="outline" fullWidth onClick={() => handleStatusChange('rejected')} disabled={actionLoading}>
                  Refuser
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <Button variant="primary" fullWidth onClick={() => handleStatusChange('in_progress')} disabled={actionLoading}>
                Commencer le service
              </Button>
            )}
            {booking.status === 'in_progress' && (
              <Button variant="primary" fullWidth onClick={() => handleStatusChange('completed')} disabled={actionLoading}>
                Terminer le service
              </Button>
            )}
          </div>
        </div>

        <div className="contact-row">
          <button className="contact-btn" onClick={() => {
            if (booking?.client?.telephone) {
              window.open(`tel:${booking.client.telephone}`)
            }
          }}>
            <Phone size={20} /> Appeler
          </button>
          <button className="contact-btn" onClick={async () => {
            if (!booking?.client_id) return
            try {
              const conversation = await chatService.createIndividualConversation(booking.client_id)
              navigate(`/messages/chat/${conversation.id}`)
            } catch {
              navigate('/messages')
            }
          }}>
            <MessageCircle size={20} /> Message
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ActiveBooking

