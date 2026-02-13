import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { walletService, Transaction } from '../../services/wallet.service'
import './WalletHome.css'

const WalletHome = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number>(0)
  const [currency, setCurrency] = useState<string>('XAF')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger le solde
      const balanceData = await walletService.getBalance()
      setBalance(balanceData.balance || 0)
      setCurrency(balanceData.currency || 'XAF')

      // Charger les transactions
      const transactionsData = await walletService.getTransactions(undefined, 20)
      setTransactions(transactionsData.transactions || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement du wallet:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('fr-FR')
    return `${amount >= 0 ? '+' : '-'}${formatted} ${currency}`
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'credit' || type === 'transfer') {
      return <ArrowDownLeft size={20} />
    }
    return <ArrowUpRight size={20} />
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      credit: 'Crédit',
      debit: 'Débit',
      payment: 'Paiement',
      transfer: 'Transfert',
      withdrawal: 'Retrait',
    }
    return labels[type] || type
  }

  // Calculer les statistiques du mois
  const currentMonthTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    const now = new Date()
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
  })

  const monthlySpent = currentMonthTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  const monthlyEarned = currentMonthTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <ScreenLayout title="Wallet" showBack showBottomNav>
      <div className="wallet-home">
        {loading && balance === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
            <p>{error}</p>
            <Button variant="outline" onClick={loadWalletData} style={{ marginTop: '10px' }}>
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            <div className="wallet-card">
              <div className="card-gradient"></div>
              <div className="card-content">
                <p className="balance-label">Balance</p>
                <h2 className="balance-amount">
                  {balance.toLocaleString('fr-FR')} {currency}
                </h2>
                <p className="balance-subtitle">Solde disponible</p>
              </div>
            </div>
            <div className="wallet-actions">
              <Button variant="secondary" fullWidth onClick={() => navigate('/wallet/topup')}>
                Recharger
              </Button>
              <Button variant="outline" fullWidth onClick={() => navigate('/professional/finances/withdraw')}>Retirer</Button>
            </div>
            <div className="quick-stats">
              <div className="stat-card">
                <p className="stat-label">Dépensé ce mois</p>
                <p className="stat-value">{monthlySpent.toLocaleString('fr-FR')} {currency}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Reçu ce mois</p>
                <p className="stat-value">{monthlyEarned.toLocaleString('fr-FR')} {currency}</p>
              </div>
            </div>
            <div className="transaction-history">
              <h3>Historique des transactions</h3>
              <div className="transactions-list">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="transaction-item" 
                      onClick={() => navigate(`/wallet/transaction/${tx.id}`)}
                    >
                      <div className="transaction-icon">{getTransactionIcon(tx.type)}</div>
                      <div className="transaction-info">
                        <p className="transaction-type">{getTransactionTypeLabel(tx.type)}</p>
                        <p className="transaction-description">
                          {tx.description || 'Transaction'}
                        </p>
                      </div>
                      <p className={`transaction-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                        {formatAmount(tx.amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Aucune transaction</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default WalletHome




