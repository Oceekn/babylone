import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import './WalletHome.css'

const WalletHome = () => {
  const navigate = useNavigate()

  const transactions = [
    { id: 1, type: 'Transfer', description: 'Transfer from Samuel', amount: '+1,000 XAF', icon: <ArrowDownLeft size={20} /> },
    { id: 2, type: 'Payment', description: 'Payment to shop', amount: '-500 XAF', icon: <ArrowUpRight size={20} /> },
    { id: 3, type: 'Transfer', description: 'Transfer to Marie', amount: '-200 XAF', icon: <ArrowUpRight size={20} /> },
    { id: 4, type: 'Payment', description: 'Payment to restaurant', amount: '-300 XAF', icon: <ArrowUpRight size={20} /> }
  ]

  return (
    <ScreenLayout title="Wallet" showBack showBottomNav>
      <div className="wallet-home">
        <div className="wallet-card">
          <div className="card-gradient"></div>
          <div className="card-content">
            <p className="balance-label">Balance</p>
            <h2 className="balance-amount">12,345 XAF</h2>
            <p className="balance-subtitle">Available balance</p>
          </div>
        </div>
        <div className="wallet-actions">
          <Button variant="secondary" fullWidth onClick={() => navigate('/wallet/topup')}>
            Recharger
          </Button>
          <Button variant="outline" fullWidth>Retirer</Button>
        </div>
        <div className="quick-stats">
          <div className="stat-card">
            <p className="stat-label">This month spent</p>
            <p className="stat-value">2,345 XAF</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">This month earned</p>
            <p className="stat-value">1,234 XAF</p>
          </div>
        </div>
        <div className="transaction-history">
          <h3>Transaction History</h3>
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item" onClick={() => navigate(`/wallet/transaction/${tx.id}`)}>
                <div className="transaction-icon">{tx.icon}</div>
                <div className="transaction-info">
                  <p className="transaction-type">{tx.type}</p>
                  <p className="transaction-description">{tx.description}</p>
                </div>
                <p className={`transaction-amount ${tx.amount.startsWith('+') ? 'positive' : 'negative'}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default WalletHome



