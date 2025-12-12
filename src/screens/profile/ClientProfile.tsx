import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Settings, ChevronRight, Edit } from 'lucide-react'
import './ClientProfile.css'

const ClientProfile = () => {
  const navigate = useNavigate()

  const menuItems = [
    { label: 'Personal Information', icon: <Edit size={20} />, route: '/profile/edit' },
    { label: 'Privacy and Security', icon: <ChevronRight size={20} />, route: '/profile/privacy' },
    { label: 'Notifications', icon: <ChevronRight size={20} />, route: '/profile/notifications' },
    { label: 'Favorites', icon: <ChevronRight size={20} />, route: '/profile/favorites' },
    { label: 'Review History', icon: <ChevronRight size={20} />, route: '/bookings' },
    { label: 'Help Center', icon: <ChevronRight size={20} />, route: '#' },
    { label: 'About the App', icon: <ChevronRight size={20} />, route: '#' },
    { label: 'Logout', icon: <ChevronRight size={20} />, route: '/' }
  ]

  return (
    <ScreenLayout
      title=""
      rightAction={<Settings size={24} />}
      showBottomNav
    >
      <div className="client-profile">
        <div className="profile-chart">
          <div className="pie-chart">
            <div className="chart-segment grey"></div>
            <div className="chart-segment green"></div>
            <div className="chart-segment orange"></div>
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-avatar">👤</div>
          <h2 className="profile-name">Aisha N.</h2>
          <p className="profile-title">Entrepreneur</p>
          <p className="profile-stats">123 friends 45 bookings completed</p>
        </div>
        <div className="menu-section">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="menu-item"
              onClick={() => navigate(item.route)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ClientProfile

