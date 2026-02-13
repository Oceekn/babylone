import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Plus, Loader, AlertCircle } from 'lucide-react'
import { walletService } from '../../services/wallet.service'
import { bookingsService } from '../../services/bookings.service'
import { authService } from '../../services/auth.service'
import './PaymentMethod.css'

interface BookingFlowData {
  professionalId: string
  professionalName: string
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  currency: string
  scheduledAt: string
  durationMinutes: number
  notes?: string
  address?: string
}

const SERVICE_FEE_PERCENT = 10

const PaymentMethod = () => {
  const navigate = useNavigate()
  const [bookingFlow, setBookingFlow] = useState<BookingFlowData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bookingFlow')
    if (stored) {
      setBookingFlow(JSON.parse(stored))
    } else {
      navigate('/services')
      return
    }
    loadWallet()
  }, [])

  const loadWallet = async () => {
    if (!authService.isAuthenticated()) {
      setLoadingWallet(false)
      return
    }
    try {
      const data = await walletService.getBalance()
      setWalletBalance(data.balance)
    } catch (err) {
      console.warn('Wallet non disponible:', err)
      setWalletBalance(0)
    } finally {
      setLoadingWallet(false)
    }
  }

  if (!bookingFlow) return null

  const servicePrice = bookingFlow.servicePrice
  const serviceFee = Math.round(servicePrice * SERVICE_FEE_PERCENT / 100)
  const totalAmount = servicePrice + serviceFee

  const isDeposit = paymentMethod === 'deposit'
  const depositAmount = isDeposit ? Math.round(totalAmount * 0.5) : totalAmount

  const canPay = paymentMethod === 'wallet' ? walletBalance >= depositAmount : true

  const handlePayment = async () => {
    if (!bookingFlow || processing) return

    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      if (paymentMethod === 'wallet') {
        // Paiement par wallet : creer la reservation avec debit
        const result = await bookingsService.createWithPayment({
          professional_id: bookingFlow.professionalId,
          service_id: bookingFlow.serviceId,
          scheduled_at: bookingFlow.scheduledAt,
          duration_minutes: bookingFlow.durationMinutes,
          price: depositAmount,
          currency: bookingFlow.currency,
          notes: bookingFlow.notes,
          address: bookingFlow.address,
        })

        // Stocker le resultat pour la confirmation
        const confirmationData = {
          ...bookingFlow,
          bookingId: result.booking.id,
          transactionId: result.transaction.id,
          amountPaid: depositAmount,
          totalAmount,
          paymentMethod,
          isDeposit,
          status: result.booking.status,
        }
        localStorage.setItem('bookingFlow', JSON.stringify(confirmationData))
        navigate('/services/payment/confirmation')
      } else {
        // Orange Money / MTN Money : creer la reservation sans paiement (simule)
        const result = await bookingsService.create({
          professional_id: bookingFlow.professionalId,
          service_id: bookingFlow.serviceId,
          scheduled_at: bookingFlow.scheduledAt,
          duration_minutes: bookingFlow.durationMinutes,
          price: depositAmount,
          currency: bookingFlow.currency,
          notes: bookingFlow.notes,
          address: bookingFlow.address,
        })

        const confirmationData = {
          ...bookingFlow,
          bookingId: result.id,
          amountPaid: depositAmount,
          totalAmount,
          paymentMethod,
          isDeposit,
          status: result.status,
        }
        localStorage.setItem('bookingFlow', JSON.stringify(confirmationData))
        navigate('/services/payment/confirmation')
      }
    } catch (err: any) {
      console.error('Erreur paiement:', err)
      const msg = err.response?.data?.message || 'Erreur lors du paiement'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setProcessing(false)
    }
  }

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`
  }

  return (
    <ScreenLayout title="Paiement" showBack showBottomNav>
      <div className="payment-method">
        <div className="wallet-balance">
          <div>
            <p className="balance-label">Solde du portefeuille</p>
            <p className="balance-amount">
              {loadingWallet ? '...' : formatAmount(walletBalance)}
            </p>
          </div>
          <button className="add-balance-btn" onClick={() => navigate('/wallet/topup')}>
            <Plus size={20} />
          </button>
        </div>

        <div className="payment-methods">
          <h3>Methode de paiement</h3>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Payer avec le portefeuille</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="orange"
              checked={paymentMethod === 'orange'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Orange Money</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="mtn"
              checked={paymentMethod === 'mtn'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>MTN Money</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="deposit"
              checked={paymentMethod === 'deposit'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Acompte (50%) + Solde apres service</span>
          </label>
        </div>

        <div className="payment-summary">
          <h3>Resume du paiement</h3>
          <div className="summary-row">
            <span>{bookingFlow.serviceName}</span>
            <span>{formatAmount(servicePrice)}</span>
          </div>
          <div className="summary-row">
            <span>Frais de service ({SERVICE_FEE_PERCENT}%)</span>
            <span>{formatAmount(serviceFee)}</span>
          </div>
          {isDeposit && (
            <div className="summary-row discount">
              <span>Acompte (50%)</span>
              <span>{formatAmount(depositAmount)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>{isDeposit ? 'A payer maintenant' : 'Total'}</span>
            <span>{formatAmount(depositAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="payment-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {paymentMethod === 'wallet' && !loadingWallet && walletBalance < depositAmount && (
          <div className="payment-error">
            <AlertCircle size={16} />
            <span>Solde insuffisant. Rechargez votre portefeuille.</span>
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={handlePayment}
          disabled={processing || !canPay}
        >
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader size={16} className="spin" /> Traitement en cours...
            </span>
          ) : (
            `Payer ${formatAmount(depositAmount)}`
          )}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default PaymentMethod

