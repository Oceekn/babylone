import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Download } from 'lucide-react'
import './FinancialDashboard.css'

const FinancialDashboard = () => {
  const navigate = useNavigate()

  const transactions = [
    { id: 1, service: 'Service A', amount: '+1000 XAF' },
    { id: 2, service: 'Service B', amount: '+500 XAF' },
    { id: 3, service: 'Service C', amount: '+2000 XAF' }
  ]

  return (
    <ScreenLayout title="Finances" showBack showBottomNav>
      <div className="financial-dashboard">
        <div className="financial-overview">
          <div className="overview-card">
            <p className="overview-label">Solde disponible</p>
            <p className="overview-amount">12 500 XAF</p>
            <div className="card-icon">💰</div>
          </div>
          <div className="overview-card">
            <p className="overview-label">En attente de vérification</p>
            <p className="overview-amount">5 000 XAF</p>
            <div className="card-icon">🪙</div>
          </div>
          <div className="overview-card">
            <p className="overview-label">Total revenu (mensuel)</p>
            <p className="overview-amount">25 000 XAF</p>
            <div className="card-icon">💵</div>
          </div>
        </div>
        <Button variant="primary" fullWidth onClick={() => navigate('/professional/finances/withdraw')}>
          Retirer
        </Button>
        <div className="revenue-overview">
          <div className="section-header">
            <h3>Aperçu des revenus</h3>
            <div className="growth-indicator">
              <span>+15%</span>
              <span className="growth-text">Ce mois-ci +15%</span>
            </div>
          </div>
          <div className="chart-placeholder">📊</div>
        </div>
        <div className="profitable-services">
          <div className="section-header">
            <h3>Services les plus rentables</h3>
            <div className="growth-indicator">
              <span>+8%</span>
              <span className="growth-text">Ce mois-ci +8%</span>
            </div>
          </div>
          <div className="chart-placeholder">📊</div>
        </div>
        <div className="transaction-history">
          <h3>Historique des transactions</h3>
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div>
                  <p className="tx-service">Transaction {tx.id} {tx.service}</p>
                </div>
                <p className="tx-amount">{tx.amount}</p>
              </div>
            ))}
          </div>
        </div>
        <Button variant="outline" fullWidth>
          <Download size={20} />
          Télécharger relevé mensuel
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default FinancialDashboard



