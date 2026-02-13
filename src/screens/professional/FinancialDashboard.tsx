import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Loader, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { walletService, Transaction } from '../../services/wallet.service'
import './FinancialDashboard.css'

const FinancialDashboard = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [walletData, txData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(undefined, 20),
      ])
      setBalance(walletData.balance)
      setTransactions(txData.transactions || txData as any || [])
    } catch (err) {
      console.error('Erreur chargement finances:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => `${Number(amount).toLocaleString('fr-FR')} FCFA`

  // Calculer les revenus du mois
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthTransactions = Array.isArray(transactions) ? transactions.filter(t =>
    new Date(t.created_at) >= monthStart && t.status === 'completed'
  ) : []
  const monthRevenue = monthTransactions
    .filter(t => t.type === 'credit' || t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <ScreenLayout title="Finances" showBack showBottomNav>
      <div className="financial-dashboard">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : (
          <>
            <div className="financial-overview">
              <div className="overview-card highlight">
                <p className="overview-label">Solde disponible</p>
                <p className="overview-amount">{formatAmount(balance)}</p>
              </div>
              <div className="overview-card">
                <p className="overview-label">Revenu du mois</p>
                <p className="overview-amount">{formatAmount(monthRevenue)}</p>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={() => navigate('/professional/finances/withdraw')}>
              Retirer des fonds
            </Button>

            <div className="transaction-history">
              <h3>Historique des transactions</h3>
              {(!Array.isArray(transactions) || transactions.length === 0) ? (
                <p style={{ color: '#888', fontSize: '14px' }}>Aucune transaction</p>
              ) : (
                <div className="transactions-list">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="transaction-item"
                      onClick={() => navigate(`/wallet/transaction/${tx.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tx-icon">
                        {tx.type === 'credit' ? (
                          <ArrowDownRight size={20} color="#4CAF50" />
                        ) : (
                          <ArrowUpRight size={20} color="#FF5252" />
                        )}
                      </div>
                      <div className="tx-info">
                        <p className="tx-description">{tx.description || tx.type}</p>
                        <p className="tx-date">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <p className={`tx-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatAmount(Number(tx.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default FinancialDashboard
