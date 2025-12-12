import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Calendar, MessageCircle } from 'lucide-react'
import './BookingRequest.css'

const BookingRequest = () => {
  const navigate = useNavigate()
  
  return (
    <ScreenLayout title="Demandes de réservation" showBack showBottomNav>
      <div className="booking-request">
        <div className="request-card">
          <div className="client-header">
            <div className="client-avatar">👤</div>
            <div className="client-info">
              <h3>Client</h3>
              <p>Service: Coiffure à domicile</p>
              <p className="service-price">15000 FCFA</p>
            </div>
          </div>
          <div className="request-details">
            <div className="detail-row">
              <Calendar size={20} />
              <div>
                <p className="detail-label">Date et heure préférée</p>
                <p className="detail-value">15 mai 2024, 14h00</p>
              </div>
            </div>
            <div className="detail-row">
              <MessageCircle size={20} />
              <div>
                <p className="detail-label">Message du client</p>
                <p className="detail-value">
                  Bonjour, je voudrais une coupe à partir de 14h. Est-ce que cela vous convient ?
                </p>
              </div>
            </div>
          </div>
          <div className="request-actions">
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => navigate('/professional/bookings/active/1')}
            >
              Accepter
            </Button>
            <Button variant="outline" fullWidth>Refuser</Button>
            <Button variant="outline" fullWidth>Proposer une alternative</Button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default BookingRequest

