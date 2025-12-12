import { useNavigate, useLocation } from 'react-router-dom'
import { Home, MessageCircle, Users, Briefcase, User } from 'lucide-react'
import './BottomNavigation.css'

interface BottomNavigationProps {
  activeTab?: 'home' | 'messages' | 'social' | 'services' | 'profile'
}

const BottomNavigation = ({ activeTab }: BottomNavigationProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const getActiveTab = () => {
    if (activeTab) return activeTab
    const path = location.pathname
    if (path.includes('/client/home') || path === '/') return 'home'
    if (path.includes('/messages')) return 'messages'
    if (path.includes('/social')) return 'social'
    if (path.includes('/services')) return 'services'
    if (path.includes('/profile')) return 'profile'
    return 'home'
  }

  const currentTab = getActiveTab()

  return (
    <nav className="bottom-navigation">
      <button
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => navigate('/client/home')}
      >
        <Home size={24} />
        <span>Accueil</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'messages' ? 'active' : ''}`}
        onClick={() => navigate('/messages')}
      >
        <MessageCircle size={24} />
        <span>Messages</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'social' ? 'active' : ''}`}
        onClick={() => navigate('/social')}
      >
        <Users size={24} />
        <span>Social</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'services' ? 'active' : ''}`}
        onClick={() => navigate('/services')}
      >
        <Briefcase size={24} />
        <span>Services</span>
      </button>
      <button
        className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={24} />
        <span>Profil</span>
      </button>
    </nav>
  )
}

export default BottomNavigation



