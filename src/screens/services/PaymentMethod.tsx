import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Plus } from 'lucide-react'
import './PaymentMethod.css'

const PaymentMethod = () => {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  return (
    <ScreenLayout title="Paiement" showBack showBottomNav>
      <div className="payment-method">
        <div className="wallet-balance">
          <div>
            <p className="balance-label">Solde du portefeuille</p>
            <p className="balance-amount">12 500 FCFA</p>
          </div>
          <button className="add-balance-btn">
            <Plus size={20} />
          </button>
        </div>

        <div className="payment-methods">
          <h3>Méthode de paiement</h3>
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
            <span>Acompte (50%) + Solde après service</span>
          </label>
        </div>

        <div className="payment-summary">
          <h3>Résumé du paiement</h3>
          <div className="summary-row">
            <span>Prix total</span>
            <span>15,000 FCFA</span>
          </div>
          <div className="summary-row">
            <span>Frais de service</span>
            <span>1,500 FCFA</span>
          </div>
          <div className="summary-row discount">
            <span>Réduction</span>
            <span>-500 FCFA</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>16,000 FCFA</span>
          </div>
        </div>

        <Button variant="secondary" fullWidth onClick={() => navigate('/services/payment/confirmation')}>
          Procéder au paiement
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default PaymentMethod



