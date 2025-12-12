import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Briefcase, DollarSign, User } from 'lucide-react'
import './BottomNavigation.css'

interface ProfessionalBottomNavigationProps {
  activeTab?: 'dashboard' | 'bookings' | 'services' | 'finances' | 'profile'
}

const ProfessionalBottomNavigation = ({ activeTab }: ProfessionalBottomNavigationProps) => {
  const navigate = useNavigate()
  const location = useLocation()

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
        className={`nav-item ${currentTab === 'bookings' ? 'active' : ''}`}
        onClick={() => navigate('/professional/bookings')}
      >
        <Calendar size={24} fill={currentTab === 'bookings' ? '#000000' : 'none'} />
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

