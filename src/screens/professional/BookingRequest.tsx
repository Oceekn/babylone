import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Calendar, MessageCircle, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './BookingRequest.css'

const BookingRequest = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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

  const handleAction = async (id: string, status: 'confirmed' | 'rejected') => {
    try {
      setActionLoading(id)
      setActionError(null)
      await bookingsService.updateStatus(id, status)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (err: any) {
      console.error('Erreur action:', err)
      const msg = err.response?.data?.message || 'Erreur lors de la mise a jour'
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
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '10px 14px', margin: '0 16px 12px', color: '#D32F2F', fontSize: '13px' }}>
            {actionError}
          </div>
        )}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <p>Aucune demande en attente</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="request-card">
              <div className="client-header">
                <div className="client-avatar">
                  {b.client?.avatar_url ? (
                    <img src={b.client.avatar_url} alt="" />
                  ) : (
                    getClientName(b).charAt(0)
                  )}
                </div>
                <div className="client-info">
                  <h3>{getClientName(b)}</h3>
                  <p>Service: {b.service?.title || 'Non specifie'}</p>
                  {b.price && <p className="service-price">{Number(b.price).toLocaleString('fr-FR')} FCFA</p>}
                </div>
              </div>
              <div className="request-details">
                <div className="detail-row">
                  <Calendar size={20} />
                  <div>
                    <p className="detail-label">Date et heure</p>
                    <p className="detail-value">
                      {new Date(b.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' a '}
                      {new Date(b.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {b.notes && (
                  <div className="detail-row">
                    <MessageCircle size={20} />
                    <div>
                      <p className="detail-label">Message du client</p>
                      <p className="detail-value">{b.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="request-actions">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleAction(b.id, 'confirmed')}
                  disabled={actionLoading === b.id}
                >
                  {actionLoading === b.id ? 'Traitement...' : 'Accepter'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleAction(b.id, 'rejected')}
                  disabled={actionLoading === b.id}
                >
                  Refuser
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </ScreenLayout>
  )
}

export default BookingRequest
