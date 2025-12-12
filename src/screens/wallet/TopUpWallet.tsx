import { useState } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { ArrowDownLeft } from 'lucide-react'
import './TopUpWallet.css'

const TopUpWallet = () => {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  const quickAmounts = ['5,000', '10,000', '25,000', 'Other']

  return (
    <ScreenLayout title="Top-Up Wallet" showBack showBottomNav>
      <div className="topup-wallet">
        <div className="available-balance">
          <p className="balance-label">Solde disponible</p>
          <p className="balance-amount">12 500 XAF</p>
        </div>
        <Input
          label="Enter amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="quick-amounts">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              className="amount-btn"
              onClick={() => setAmount(amt === 'Other' ? '' : amt)}
            >
              {amt}
            </button>
          ))}
        </div>
        <div className="payment-methods">
          <h3>Payment Method</h3>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div>
              <span>Babylone Wallet</span>
              <span className="option-detail">Balance: 12,500</span>
            </div>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div>
              <span>Credit Card</span>
              <span className="option-detail">0000</span>
            </div>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="payment"
              value="mobile"
              checked={paymentMethod === 'mobile'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div>
              <span>Mobile Money</span>
              <span className="option-detail">0000</span>
            </div>
            <input type="checkbox" className="toggle-switch" defaultChecked />
          </label>
        </div>
        <Button variant="secondary" fullWidth>Recharger</Button>
        <div className="recent-topups">
          <h3>Recent Top-Ups</h3>
          <div className="topup-item">
            <ArrowDownLeft size={20} />
            <div>
              <p>10,000</p>
              <p className="topup-date">2024-01-15</p>
            </div>
            <span className="topup-status">Success</span>
          </div>
          <div className="topup-item">
            <ArrowDownLeft size={20} />
            <div>
              <p>5,000</p>
              <p className="topup-date">2023-12-20</p>
            </div>
            <span className="topup-status">Success</span>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default TopUpWallet



