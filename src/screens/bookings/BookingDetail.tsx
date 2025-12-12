import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, MapPin } from 'lucide-react'
import './BookingDetail.css'

const BookingDetail = () => {
  return (
    <ScreenLayout title="Détails de la réservation" showBack showBottomNav>
      <div className="booking-detail">
        <div className="professional-header">
          <div className="prof-avatar">👤</div>
          <div className="prof-info">
            <h3>Jean-Pierre</h3>
            <div className="prof-rating">
              <Star size={16} fill="currentColor" />
              <span>4.8 (123 avis)</span>
            </div>
          </div>
          <Button variant="secondary">Contacter</Button>
        </div>
        <div className="booking-sections">
          <div className="section">
            <p className="section-label">Service</p>
            <p className="section-value">Coupe de cheveux, Coiffure</p>
          </div>
          <div className="section">
            <p className="section-label">Date et heure</p>
            <p className="section-value">15 août - 14h00</p>
          </div>
          <div className="section">
            <p className="section-label">Durée</p>
            <p className="section-value">1 heure</p>
          </div>
          <div className="section">
            <p className="section-label">Lieu</p>
            <div className="map-preview">
              <MapPin size={20} />
              <span>Yaoundé</span>
            </div>
          </div>
          <div className="section">
            <p className="section-label">Instructions spéciales</p>
            <p className="section-value">Veuillez apporter votre propre serviette et shampoing.</p>
          </div>
          <div className="section">
            <p className="section-label">Statut</p>
            <div className="status-options">
              <label><input type="radio" name="status" defaultChecked /> Réservé</label>
              <label><input type="radio" name="status" /> Confirmé</label>
              <label><input type="radio" name="status" /> En cours</label>
              <label><input type="radio" name="status" /> Terminé</label>
            </div>
          </div>
        </div>
        <div className="booking-actions">
          <Button variant="outline" fullWidth>Modifier</Button>
          <Button variant="secondary" fullWidth>Annuler</Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default BookingDetail



