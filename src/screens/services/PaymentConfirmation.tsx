import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { CheckCircle, Scissors, Calendar, User, DollarSign } from 'lucide-react'
import './PaymentConfirmation.css'

interface ConfirmationData {
  professionalName: string
  serviceName: string
  servicePrice: number
  currency: string
  scheduledAt: string
  amountPaid: number
  totalAmount: number
  paymentMethod: string
  isDeposit: boolean
  bookingId: string
  status: string
}

const PaymentConfirmation = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<ConfirmationData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bookingFlow')
    if (stored) {
      setData(JSON.parse(stored))
    }
  }, [])

  const formatAmount = (amount: number) => {
    return `${Number(amount).toLocaleString('fr-FR')} FCFA`
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ' a ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case 'wallet': return 'Portefeuille'
      case 'orange': return 'Orange Money'
      case 'mtn': return 'MTN Money'
      case 'deposit': return 'Acompte 50%'
      default: return method
    }
  }

  const handleGoHome = () => {
    localStorage.removeItem('bookingFlow')
    localStorage.removeItem('bookingFlow_professionalId')
    localStorage.removeItem('bookingFlow_professionalName')
    navigate('/client/home')
  }

  const handleViewBooking = () => {
    if (data?.bookingId) {
      localStorage.removeItem('bookingFlow')
      localStorage.removeItem('bookingFlow_professionalId')
      localStorage.removeItem('bookingFlow_professionalName')
      navigate(`/bookings/${data.bookingId}`)
    }
  }

  if (!data) {
    return (
      <ScreenLayout title="Confirmation" showBack showBottomNav>
        <div className="payment-confirmation">
          <p style={{ textAlign: 'center', padding: '40px 20px' }}>Aucune donnee de reservation</p>
          <Button variant="secondary" fullWidth onClick={() => navigate('/client/home')}>
            Retour a l'accueil
          </Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Paiement effectue" showBottomNav>
      <div className="payment-confirmation">
        <div className="success-message">
          <CheckCircle size={48} color="#4CAF50" />
          <h2>Paiement effectue avec succes</h2>
          <p className="booking-status">
            Statut : {data.status === 'confirmed' ? 'Confirmee' : 'En attente de confirmation'}
          </p>
        </div>

        <div className="service-details">
          <div className="detail-item">
            <Scissors size={24} />
            <div>
              <p className="detail-label">Service</p>
              <p className="detail-value">{data.serviceName}</p>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={24} />
            <div>
              <p className="detail-label">Date et heure</p>
              <p className="detail-value">{formatDate(data.scheduledAt)}</p>
            </div>
          </div>
          <div className="detail-item">
            <User size={24} />
            <div>
              <p className="detail-label">Professionnel</p>
              <p className="detail-value">{data.professionalName}</p>
            </div>
          </div>
          <div className="detail-item">
            <DollarSign size={24} />
            <div>
              <p className="detail-label">Montant paye</p>
              <p className="detail-value">{formatAmount(data.amountPaid)}</p>
            </div>
          </div>
        </div>

        <div className="payment-info-card">
          <div className="info-row">
            <span>Methode</span>
            <span>{paymentMethodLabel(data.paymentMethod)}</span>
          </div>
          {data.isDeposit && (
            <div className="info-row">
              <span>Reste a payer</span>
              <span>{formatAmount(data.totalAmount - data.amountPaid)}</span>
            </div>
          )}
          <div className="info-row">
            <span>Reference</span>
            <span className="reference">#{data.bookingId?.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <Button variant="outline" fullWidth onClick={handleViewBooking}>
            Voir la reservation
          </Button>
          <Button variant="secondary" fullWidth onClick={handleGoHome}>
            Retour a l'accueil
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default PaymentConfirmation
