import { useState, useEffect } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Calendar, MessageCircle, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './BookingRequest.css'

const BookingRequest = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingsService.getReceivedBookings('pending')
      setBookings(data)
    } catch (err) {
      console.error('Erreur chargement demandes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: string) => {
    try {
      setActionLoading(id)
      setActionError(null)
      await bookingsService.updateStatus(id, 'confirmed')
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la mise a jour'
      setActionError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      setTimeout(() => setActionError(null), 4000)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id)
      setActionError(null)
      await bookingsService.updateStatus(id, 'rejected', rejectionReason.trim() || undefined)
      setBookings(prev => prev.filter(b => b.id !== id))
      setRejectingId(null)
      setRejectionReason('')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors du refus'
      setActionError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      setTimeout(() => setActionError(null), 4000)
    } finally {
      setActionLoading(null)
    }
  }

  const getClientName = (b: Booking) => {
    if (b.client) return `${b.client.first_name || ''} ${b.client.last_name || ''}`.trim() || 'Client'
    return 'Client'
  }

  return (
    <ScreenLayout title="Demandes de reservation" showBack showBottomNav>
      <div className="booking-request">
        {actionError && (
          <div className="booking-request-error">
            {actionError}
          </div>
        )}
        {loading ? (
          <div className="booking-request-loading">
            <Loader size={32} className="spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="booking-request-empty">
            <p>Aucune demande en attente</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="request-card">
              <div className="request-card-inner">
                <div className="client-header">
                  <div className="client-avatar" aria-hidden>
                    {b.client?.avatar_url ? (
                      <img
                        src={b.client.avatar_url}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling
                          if (fallback) (fallback as HTMLElement).style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <span className="client-initial" style={b.client?.avatar_url ? { display: 'none' } : undefined}>
                      {getClientName(b).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="client-info">
                    <h3 className="client-name">{getClientName(b)}</h3>
                    <p className="service-label">{b.service?.title || 'Service non spécifié'}</p>
                    {b.price != null && (
                      <p className="service-price">{Number(b.price).toLocaleString('fr-FR')} FCFA</p>
                    )}
                  </div>
                </div>
                <div className="request-details">
                  <div className="detail-row">
                    <Calendar size={20} className="detail-icon" aria-hidden />
                    <div className="detail-content">
                      <span className="detail-label">Date et heure</span>
                      <span className="detail-value">
                        {new Date(b.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' à '}
                        {new Date(b.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {b.notes && (
                    <div className="detail-row">
                      <MessageCircle size={20} className="detail-icon" aria-hidden />
                      <div className="detail-content">
                        <span className="detail-label">Message du client</span>
                        <span className="detail-value">{b.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="request-actions">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleConfirm(b.id)}
                    disabled={actionLoading === b.id}
                  >
                    {actionLoading === b.id ? 'Traitement...' : 'Accepter'}
                  </Button>
                  {rejectingId !== b.id ? (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => setRejectingId(b.id)}
                      disabled={actionLoading === b.id}
                    >
                      Refuser
                    </Button>
                  ) : (
                    <div className="reject-reason-box">
                      <textarea
                        placeholder="Raison du refus (optionnel)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                        className="reject-reason-input"
                      />
                      <div className="reject-reason-actions">
                        <Button variant="outline" onClick={() => { setRejectingId(null); setRejectionReason('') }}>
                          Annuler
                        </Button>
                        <Button variant="secondary" onClick={() => handleReject(b.id)} disabled={actionLoading === b.id}>
                          {actionLoading === b.id ? 'Envoi...' : 'Confirmer le refus'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScreenLayout>
  )
}

export default BookingRequest
