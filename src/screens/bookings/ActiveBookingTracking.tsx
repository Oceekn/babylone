import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Phone, MessageCircle } from 'lucide-react'
import './ActiveBookingTracking.css'

const ActiveBookingTracking = () => {
  return (
    <ScreenLayout title="Service en cours" showBack showBottomNav>
      <div className="active-booking-tracking">
        <div className="map-container">
          <div className="map-placeholder">🗺️ Douala</div>
        </div>
        <div className="service-status">
          <div className="status-banner active">
            Le service a commencé
          </div>
          <div className="status-actions">
            <Button variant="outline" className="status-btn">
              Le service est terminé
            </Button>
            <button className="action-icon">
              <Phone size={20} />
            </button>
            <button className="action-icon">
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ActiveBookingTracking



