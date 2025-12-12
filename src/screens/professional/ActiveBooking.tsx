import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, MapPin, Phone, MessageCircle } from 'lucide-react'
import './ActiveBooking.css'

const ActiveBooking = () => {
  return (
    <ScreenLayout title="Active Booking" showBack showBottomNav>
      <div className="active-booking">
        <div className="client-info-card">
          <div className="client-avatar">👤</div>
          <div className="client-details">
            <h3>Client</h3>
            <p>Aisha N. (123 reviews)</p>
          </div>
        </div>
        <div className="service-details-grid">
          <div className="detail-box">
            <p className="detail-label">Service</p>
            <p className="detail-value">Haircut</p>
          </div>
          <div className="detail-box">
            <p className="detail-label">Date</p>
            <p className="detail-value">2024-09-15</p>
          </div>
          <div className="detail-box">
            <p className="detail-label">Time</p>
            <p className="detail-value">10:00 AM</p>
          </div>
        </div>
        <div className="location-map">
          <div className="map-placeholder">🗺️ Yaoundé</div>
          <Button variant="outline" fullWidth>
            <MapPin size={20} />
            Itinéraire
          </Button>
        </div>
        <Button variant="primary" fullWidth>Contacter le client</Button>
        <div className="actions-section">
          <h3>Actions</h3>
          <div className="action-buttons">
            <Button variant="primary" fullWidth>Commencer le service</Button>
            <Button variant="outline" fullWidth>Terminer le service</Button>
          </div>
        </div>
        <div className="notes-section">
          <h3>Notes</h3>
          <textarea
            className="notes-textarea"
            placeholder="Add notes about this service..."
            rows={4}
          />
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ActiveBooking



