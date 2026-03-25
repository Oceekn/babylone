import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Briefcase, DollarSign, User } from 'lucide-react'
import { bookingsService } from '../../services/bookings.service'
import './BottomNavigation.css'

interface ProfessionalBottomNavigationProps {
  activeTab?: 'dashboard' | 'bookings' | 'services' | 'finances' | 'profile'
}

const ProfessionalBottomNavigation = ({ activeTab }: ProfessionalBottomNavigationProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookingsBadge, setBookingsBadge] = useState(0)

  const getActiveTab = () => {
    if (activeTab) return activeTab
    const path = location.pathname
    if (path.includes('/professional/dashboard')) return 'dashboard'
    if (path.includes('/professional/bookings')) return 'bookings'
    if (path.includes('/professional/services')) return 'services'
    if (path.includes('/professional/finances')) return 'finances'
    if (path.includes('/professional/profile')) return 'profile'
    return 'dashboard'
  }

  const currentTab = getActiveTab()

  useEffect(() => {
    let cancelled = false
    const loadBadge = async () => {
      try {
        const r = await bookingsService.getProNavBadge()
        if (!cancelled) setBookingsBadge(typeof r.badge === 'number' && r.badge > 0 ? r.badge : 0)
      } catch {
        if (!cancelled) setBookingsBadge(0)
      }
    }
    loadBadge()
    const onFocus = () => loadBadge()
    window.addEventListener('focus', onFocus)
    const onVis = () => {
      if (document.visibilityState === 'visible') loadBadge()
    }
    document.addEventListener('visibilitychange', onVis)
    const interval = window.setInterval(loadBadge, 90_000)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
      window.clearInterval(interval)
    }
  }, [location.pathname])

  return (
    <nav className="bottom-navigation professional-bottom-nav">
      <button
        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => navigate('/professional/dashboard')}
      >
        <LayoutDashboard size={24} fill={currentTab === 'dashboard' ? '#000000' : 'none'} />
        <span>Dashboard</span>
      </button>
      <button
        type="button"
        className={`nav-item nav-item--with-badge ${currentTab === 'bookings' ? 'active' : ''}`}
        onClick={() => navigate('/professional/bookings')}
        aria-label={bookingsBadge > 0 ? `Réservations, ${bookingsBadge} éléments à voir` : 'Réservations'}
      >
        <span className="nav-item-icon-wrap">
          <Calendar size={24} fill={currentTab === 'bookings' ? '#000000' : 'none'} />
          {bookingsBadge > 0 && (
            <span className="pro-nav-badge" aria-hidden>
              {bookingsBadge > 99 ? '99+' : bookingsBadge}
            </span>
          )}
        </span>
        <span>Réservations</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'services' ? 'active' : ''}`}
        onClick={() => navigate('/professional/services')}
      >
        <Briefcase size={24} fill={currentTab === 'services' ? '#000000' : 'none'} />
        <span>Services</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'finances' ? 'active' : ''}`}
        onClick={() => navigate('/professional/finances')}
      >
        <DollarSign size={24} fill={currentTab === 'finances' ? '#000000' : 'none'} />
        <span>Finances</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
        onClick={() => navigate('/professional/profile')}
      >
        <User size={24} fill={currentTab === 'profile' ? '#000000' : 'none'} />
        <span>Profil</span>
      </button>
    </nav>
  )
}

export default ProfessionalBottomNavigation

