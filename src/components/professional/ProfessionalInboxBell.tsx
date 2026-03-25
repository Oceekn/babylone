import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'

/** Ouvre le centre notifications + messages (espace pro). */
const ProfessionalInboxBell = () => {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="header-button"
      onClick={() => navigate('/professional/inbox')}
      aria-label="Notifications et messages"
    >
      <Bell size={24} />
    </button>
  )
}

export default ProfessionalInboxBell
