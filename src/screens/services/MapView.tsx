import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star } from 'lucide-react'
import './MapView.css'

const MapView = () => {
  return (
    <ScreenLayout showBottomNav>
      <div className="map-view">
        <div className="map-container">
          <div className="map-placeholder">🗺️</div>
        </div>
        <div className="service-card-overlay">
          <div className="service-card">
            <div className="service-image">💇</div>
            <div className="service-info">
              <h3>Salon de Coiffure Excellence</h3>
              <div className="service-rating">
                <Star size={16} fill="currentColor" />
                <span>4.8</span>
              </div>
              <div className="service-actions">
                <Button variant="secondary">Book</Button>
                <Button variant="outline">Renovation</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default MapView



