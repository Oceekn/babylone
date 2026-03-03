import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Settings, Search, X } from 'lucide-react'
import BottomNavigation from './BottomNavigation'
import ProfessionalBottomNavigation from './ProfessionalBottomNavigation'
import './ScreenLayout.css'
import '../../screens/professional/ProfessionalStyles.css'

interface ScreenLayoutProps {
  children: ReactNode
  title?: string | ReactNode
  showBack?: boolean
  showSettings?: boolean
  showSearch?: boolean
  showClose?: boolean
  showBottomNav?: boolean
  contentClassName?: string
  titleClassName?: string
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
  contentClassName,
  titleClassName,
  onBack,
  onSearch,
  onSettings,
  onClose,
  rightAction
}: ScreenLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Détecter si on est dans l'espace pro (dashboard, réservations, etc.), pas quand le client consulte /services/professional/:id
  const isProfessionalRoute = location.pathname.startsWith('/professional/')

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
            {title && (
              typeof title === 'string' ? (
                <h1 className={`header-title ${titleClassName || ''}`}>{title}</h1>
              ) : (
                <div className={`header-title-custom ${titleClassName || ''}`}>{title}</div>
              )
            )}
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
      <main className={`screen-content ${contentClassName || ''}`.trim()} style={{ paddingBottom: showBottomNav ? '100px' : undefined }}>
        {children}
      </main>
      {showBottomNav && (isProfessionalRoute ? <ProfessionalBottomNavigation /> : <BottomNavigation />)}
    </div>
  )
}

export default ScreenLayout

