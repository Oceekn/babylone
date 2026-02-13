import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Bell, Star, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './ProfessionalDashboard.css'

const ProfessionalDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const stats = await bookingsService.getStats()
      setTodayBookings(stats.todayBookings || [])
      setMonthRevenue(stats.monthRevenue || 0)
      setAvgRating(stats.avgRating || 0)
      setTotalReviews(stats.totalReviews || 0)
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const getClientName = (b: Booking) => {
    if (b.client) {
      return `${b.client.first_name || ''} ${b.client.last_name || ''}`.trim() || 'Client'
    }
    return 'Client'
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const greeting = user.first_name ? `Bonjour, ${user.first_name}` : 'Bonjour'

  return (
    <ScreenLayout title="Dashboard" rightAction={<Bell size={24} />} showBottomNav>
      <div className="professional-dashboard">
        <h2 className="greeting">{greeting}</h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <p className="metric-label">Reservations du jour</p>
                <p className="metric-value">{todayBookings.length}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Revenus du mois</p>
                <p className="metric-value">{monthRevenue.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Note moyenne</p>
                <p className="metric-value">{avgRating > 0 ? `${avgRating.toFixed(1)} ` : '- '}<Star size={14} fill={avgRating > 0 ? 'currentColor' : 'none'} style={{ verticalAlign: 'middle' }} /></p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Total avis</p>
                <p className="metric-value">{totalReviews}</p>
              </div>
            </div>

            <div className="today-reservations">
              <h3>Reservations d'aujourd'hui</h3>
              {todayBookings.length === 0 ? (
                <p style={{ color: '#888', fontSize: '14px' }}>Aucune reservation aujourd'hui</p>
              ) : (
                todayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="reservation-item"
                    onClick={() => navigate(`/professional/bookings/active/${b.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="res-avatar">
                      {b.client?.avatar_url ? (
                        <img src={b.client.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        getClientName(b).charAt(0)
                      )}
                    </div>
                    <div className="res-info">
                      <p className="res-service">{b.service?.title || 'Service'} avec {getClientName(b)}</p>
                      <p className="res-time">
                        {new Date(b.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {b.duration_minutes && ` - ${b.duration_minutes} min`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="quick-actions">
          <Button variant="outline" fullWidth onClick={() => navigate('/professional/calendar')}>
            Voir calendrier
          </Button>
          <Button variant="outline" fullWidth onClick={() => navigate('/professional/services')}>
            Gerer services
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalDashboard
