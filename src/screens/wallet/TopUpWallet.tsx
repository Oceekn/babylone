import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Loader, CheckCircle } from 'lucide-react'
import { walletService } from '../../services/wallet.service'
import './TopUpWallet.css'

const TopUpWallet = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('orange')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newBalance, setNewBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const quickAmounts = [5000, 10000, 25000, 50000]

  useEffect(() => { loadBalance() }, [])

  const loadBalance = async () => {
    try {
      const data = await walletService.getBalance()
      setBalance(data.balance)
    } catch (err) {
      console.warn('Wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Entrez un montant valide')
      return
    }
    try {
      setProcessing(true)
      setError(null)
      const result = await walletService.topup(numAmount)
      setNewBalance(result.balance)
      setSuccess(true)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors du rechargement'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <ScreenLayout title="Rechargement" showBack showBottomNav>
        <div className="topup-wallet">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle size={48} color="#4CAF50" />
            <h2 style={{ marginTop: '16px' }}>Rechargement reussi</h2>
            <p style={{ color: '#666', margin: '12px 0' }}>
              +{parseFloat(amount).toLocaleString('fr-FR')} FCFA
            </p>
            <p style={{ fontSize: '18px', fontWeight: 700 }}>
              Nouveau solde: {newBalance.toLocaleString('fr-FR')} FCFA
            </p>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button variant="secondary" fullWidth onClick={() => navigate('/wallet')}>Voir le portefeuille</Button>
              <Button variant="outline" fullWidth onClick={() => { setSuccess(false); setAmount('') }}>Autre rechargement</Button>
            </div>
          </div>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Recharger" showBack showBottomNav>
      <div className="topup-wallet">
        <div className="available-balance">
          <p className="balance-label">Solde actuel</p>
          <p className="balance-amount">
            {loading ? '...' : `${balance.toLocaleString('fr-FR')} FCFA`}
          </p>
        </div>

        <Input
          label="Montant (FCFA)"
          type="number"
          placeholder="Entrez le montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="quick-amounts">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              className={`amount-btn ${amount === String(amt) ? 'active' : ''}`}
              onClick={() => setAmount(String(amt))}
            >
              {amt.toLocaleString('fr-FR')}
            </button>
          ))}
        </div>

        <div className="payment-methods">
          <h3>Methode de paiement</h3>
          <label className="payment-option">
            <input type="radio" name="payment" value="orange" checked={paymentMethod === 'orange'} onChange={(e) => setPaymentMethod(e.target.value)} />
            <span>Orange Money</span>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" value="mtn" checked={paymentMethod === 'mtn'} onChange={(e) => setPaymentMethod(e.target.value)} />
            <span>MTN Money</span>
          </label>
        </div>

        {error && (
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#D32F2F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={handleTopup}
          disabled={processing || !amount}
        >
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader size={16} className="spin" /> Traitement...
            </span>
          ) : (
            `Recharger ${amount ? parseFloat(amount).toLocaleString('fr-FR') + ' FCFA' : ''}`
          )}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default TopUpWallet
