import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { MapPin, Phone, MessageCircle, Clock, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import { chatService } from '../../services/chat.service'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
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
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

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

  const handleStatusChange = async (newStatus: string, cancellation_reason?: string) => {
    if (!id || actionLoading) return
    try {
      setActionLoading(true)
      setActionError(null)
      const updated = await bookingsService.updateStatus(id, newStatus, cancellation_reason)
      setBooking(updated)
      if (newStatus === 'rejected') {
        setShowRejectForm(false)
        setRejectionReason('')
      }
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
      <ScreenLayout title="Reservation" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
        <div className="active-booking-loading">
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (error || !booking) {
    return (
      <ScreenLayout title="Reservation" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
        <div className="active-booking-error">
          <p>{error || 'Reservation introuvable'}</p>
          <Button variant="outline" onClick={() => navigate('/professional/bookings')}>Retour</Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Reservation active" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
      <div className="active-booking">
        <div className={`status-badge ${booking.status}`}>
          {statusLabels[booking.status] || booking.status}
        </div>

        <div className="active-booking-card client-info-card">
          <div className="client-avatar" aria-hidden>
            {booking.client?.avatar_url ? (
              <img
                src={booking.client.avatar_url}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling
                  if (fallback) (fallback as HTMLElement).style.display = 'flex'
                }}
              />
            ) : null}
            <span className="client-initial" style={booking.client?.avatar_url ? { display: 'none' } : undefined}>
              {getClientName(booking).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="client-details">
            <h3 className="client-name">{getClientName(booking)}</h3>
            {booking.client?.telephone && (
              <a href={`tel:${booking.client.telephone}`} className="client-phone">
                {booking.client.telephone}
              </a>
            )}
          </div>
        </div>

        <div className="service-details-grid">
          <div className="detail-box">
            <span className="detail-label">Service</span>
            <span className="detail-value">{booking.service?.title || '-'}</span>
          </div>
          <div className="detail-box">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {new Date(booking.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="detail-box">
            <span className="detail-label">Heure</span>
            <span className="detail-value detail-value-time">
              <Clock size={16} aria-hidden />
              {new Date(booking.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {booking.price != null && (
            <div className="detail-box detail-box-price">
              <span className="detail-label">Prix</span>
              <span className="detail-value">{Number(booking.price).toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
        </div>

        {booking.address && (
          <div className="active-booking-card location-section">
            <MapPin size={20} className="location-icon" aria-hidden />
            <span>{booking.address}</span>
          </div>
        )}

        {booking.notes && (
          <div className="active-booking-card notes-section">
            <h3 className="section-title">Notes</h3>
            <p className="notes-text">{booking.notes}</p>
          </div>
        )}

        <div className="active-booking-card actions-section">
          <h3 className="section-title">Actions</h3>
          {actionError && (
            <div className="action-error-msg">{actionError}</div>
          )}
          <div className="action-buttons">
            {booking.status === 'pending' && !showRejectForm && (
              <>
                <Button variant="primary" fullWidth onClick={() => handleStatusChange('confirmed')} disabled={actionLoading}>
                  Confirmer
                </Button>
                <Button variant="outline" fullWidth onClick={() => setShowRejectForm(true)} disabled={actionLoading}>
                  Refuser
                </Button>
              </>
            )}
            {booking.status === 'pending' && showRejectForm && (
              <div className="reject-form-inline">
                <textarea
                  placeholder="Raison du refus (optionnel)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="reject-reason-input"
                />
                <div className="reject-form-actions">
                  <Button variant="outline" onClick={() => { setShowRejectForm(false); setRejectionReason('') }}>
                    Annuler
                  </Button>
                  <Button variant="secondary" onClick={() => handleStatusChange('rejected', rejectionReason.trim() || undefined)} disabled={actionLoading}>
                    {actionLoading ? 'Envoi...' : 'Confirmer le refus'}
                  </Button>
                </div>
              </div>
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

        {['pending', 'confirmed'].includes(booking.status) && (
          <div className="reschedule-row">
            <Button variant="outline" fullWidth onClick={() => navigate(`/bookings/${booking.id}/reschedule`)}>
              Reporter la réservation
            </Button>
          </div>
        )}

        <div className="contact-row">
          <a
            href={booking.client?.telephone ? `tel:${booking.client.telephone}` : '#'}
            className="contact-btn"
            onClick={(e) => !booking?.client?.telephone && e.preventDefault()}
          >
            <Phone size={20} aria-hidden /> Appeler
          </a>
          <button type="button" className="contact-btn" onClick={async () => {
            if (!booking?.client_id) return
            try {
              const conversation = await chatService.createIndividualConversation(booking.client_id)
              navigate(`/professional/messages/chat/${conversation.id}`)
            } catch {
              navigate('/professional/inbox')
            }
          }}>
            <MessageCircle size={20} aria-hidden /> Message
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ActiveBooking

