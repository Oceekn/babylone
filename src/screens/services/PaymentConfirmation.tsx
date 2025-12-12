import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Scissors, Calendar, User, DollarSign } from 'lucide-react'
import './PaymentConfirmation.css'

const PaymentConfirmation = () => {
  const navigate = useNavigate()

  return (
    <ScreenLayout title="Paiement effectué" showBack showBottomNav>
      <div className="payment-confirmation">
        <div className="success-message">
          <h2>Paiement effectué avec succès</h2>
        </div>
        <div className="service-details">
          <div className="detail-item">
            <Scissors size={24} />
            <div>
              <p className="detail-label">Service</p>
              <p className="detail-value">Coiffure</p>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={24} />
            <div>
              <p className="detail-label">Date et heure</p>
              <p className="detail-value">15 mai 2024, 14h00</p>
            </div>
          </div>
          <div className="detail-item">
            <User size={24} />
            <div>
              <p className="detail-label">Professionnel</p>
              <p className="detail-value">Marie</p>
            </div>
          </div>
          <div className="detail-item">
            <DollarSign size={24} />
            <div>
              <p className="detail-label">Montant payé</p>
              <p className="detail-value">16 000 FCFA</p>
            </div>
          </div>
        </div>
        <div className="confirmation-actions">
          <Button variant="outline" fullWidth>
            Télécharger le reçu
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/client/home')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default PaymentConfirmation



