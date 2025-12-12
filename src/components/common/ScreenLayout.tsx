import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Settings, Search, X } from 'lucide-react'
import BottomNavigation from './BottomNavigation'
import ProfessionalBottomNavigation from './ProfessionalBottomNavigation'
import './ScreenLayout.css'
import '../../screens/professional/ProfessionalStyles.css'

interface ScreenLayoutProps {
  children: ReactNode
  title?: string
  showBack?: boolean
  showSettings?: boolean
  showSearch?: boolean
  showClose?: boolean
  showBottomNav?: boolean
  onBack?: () => void
  onSettings?: () => void
  onSearch?: () => void
  onClose?: () => void
  rightAction?: ReactNode
}

const ScreenLayout = ({
  children,
  title,
  showBack = false,
  showSettings = false,
  showSearch = false,
  showClose = false,
  showBottomNav = false,
  onBack,
  onSearch,
  onSettings,
  onClose,
  rightAction
}: ScreenLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Détecter si on est dans une route professionnelle
  const isProfessionalRoute = location.pathname.includes('/professional')

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="screen-layout" data-professional={isProfessionalRoute ? "true" : "false"}>
      {(title || showBack || showSettings || showSearch || showClose || rightAction) && (
        <header className="screen-header">
          <div className="header-left">
            {showBack && (
              <button className="header-button" onClick={handleBack}>
                <ArrowLeft size={24} />
              </button>
            )}
            {showClose && (
              <button className="header-button" onClick={onClose || handleBack}>
                <X size={24} />
              </button>
            )}
            {title && <h1 className="header-title">{title}</h1>}
          </div>
          <div className="header-right">
            {rightAction}
            {showSearch && (
              <button className="header-button" onClick={onSearch}>
                <Search size={24} />
              </button>
            )}
            {showSettings && (
              <button className="header-button" onClick={onSettings}>
                <Settings size={24} />
              </button>
            )}
          </div>
        </header>
      )}
      <main className="screen-content" style={{ paddingBottom: showBottomNav ? '80px' : '0' }}>
        {children}
      </main>
      {showBottomNav && (isProfessionalRoute ? <ProfessionalBottomNavigation /> : <BottomNavigation />)}
    </div>
  )
}

export default ScreenLayout

