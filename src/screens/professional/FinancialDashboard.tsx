import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import { Loader, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Calendar } from 'lucide-react'
import { walletService, Transaction } from '../../services/wallet.service'
import './FinancialDashboard.css'

const FinancialDashboard = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [walletData, txData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(undefined, 50),
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

  // Filtrer les transactions par période
  const getFilteredTransactions = () => {
    if (!Array.isArray(transactions)) return []
    const now = new Date()
    let startDate = new Date(0)
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    return transactions.filter(t => new Date(t.created_at) >= startDate)
  }

  const filteredTransactions = getFilteredTransactions()

  // Calculer les revenus de la période
  const periodRevenue = filteredTransactions
    .filter(t => t.status === 'completed' && (t.type === 'credit' || t.type === 'payment'))
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Calculer les dépenses de la période
  const periodExpenses = filteredTransactions
    .filter(t => t.status === 'completed' && (t.type === 'debit' || t.type === 'withdrawal'))
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Transactions complétées uniquement pour l'affichage
  const displayTransactions = filteredTransactions.filter(t => t.status === 'completed')

  return (
    <ScreenLayout title="Finances" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
      <div className="financial-dashboard">
        {loading ? (
          <div className="financial-loading">
            <Loader size={36} className="spin" />
            <p>Chargement...</p>
          </div>
        ) : (
          <>
            <div className="financial-stats-grid">
              <div className="stat-card stat-card-balance">
                <div className="stat-card-header">
                  <Wallet size={24} />
                  <span className="stat-card-label">Solde disponible</span>
                </div>
                <p className="stat-card-value">{formatAmount(balance)}</p>
              </div>
              <div className="stat-card stat-card-revenue">
                <div className="stat-card-header">
                  <TrendingUp size={24} />
                  <span className="stat-card-label">Revenus ({period === 'week' ? '7j' : period === 'month' ? 'Mois' : 'Total'})</span>
                </div>
                <p className="stat-card-value">{formatAmount(periodRevenue)}</p>
              </div>
            </div>

            {periodExpenses > 0 && (
              <div className="stat-card stat-card-expenses">
                <div className="stat-card-header">
                  <ArrowUpRight size={24} />
                  <span className="stat-card-label">Dépenses ({period === 'week' ? '7j' : period === 'month' ? 'Mois' : 'Total'})</span>
                </div>
                <p className="stat-card-value">{formatAmount(periodExpenses)}</p>
              </div>
            )}

            <button
              type="button"
              className="withdraw-btn"
              onClick={() => navigate('/professional/finances/withdraw')}
            >
              <ArrowUpRight size={20} /> Retirer des fonds
            </button>

            <div className="transactions-section">
              <div className="transactions-header">
                <h3>Transactions</h3>
                <div className="period-filters">
                  <button
                    type="button"
                    className={`period-btn ${period === 'week' ? 'active' : ''}`}
                    onClick={() => setPeriod('week')}
                  >
                    7j
                  </button>
                  <button
                    type="button"
                    className={`period-btn ${period === 'month' ? 'active' : ''}`}
                    onClick={() => setPeriod('month')}
                  >
                    Mois
                  </button>
                  <button
                    type="button"
                    className={`period-btn ${period === 'all' ? 'active' : ''}`}
                    onClick={() => setPeriod('all')}
                  >
                    Tout
                  </button>
                </div>
              </div>

              {displayTransactions.length === 0 ? (
                <div className="transactions-empty">
                  <Calendar size={40} />
                  <p>Aucune transaction</p>
                  <span className="transactions-empty-sub">Les transactions apparaîtront ici</span>
                </div>
              ) : (
                <div className="transactions-list">
                  {displayTransactions.map((tx) => {
                    const isCredit = tx.type === 'credit' || tx.type === 'payment'
                    return (
                      <div
                        key={tx.id}
                        className="transaction-card"
                        onClick={() => navigate(`/wallet/transaction/${tx.id}`)}
                      >
                        <div className={`transaction-icon ${isCredit ? 'credit' : 'debit'}`}>
                          {isCredit ? (
                            <ArrowDownRight size={20} />
                          ) : (
                            <ArrowUpRight size={20} />
                          )}
                        </div>
                        <div className="transaction-details">
                          <p className="transaction-desc">{tx.description || tx.type}</p>
                          <p className="transaction-date">
                            {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <p className={`transaction-amount ${isCredit ? 'credit' : 'debit'}`}>
                          {isCredit ? '+' : '-'}{formatAmount(Number(tx.amount))}
                        </p>
                      </div>
                    )
                  })}
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
