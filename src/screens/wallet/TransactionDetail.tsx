import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Loader } from 'lucide-react'
import { walletService, Transaction } from '../../services/wallet.service'
import './TransactionDetail.css'

const typeLabels: Record<string, string> = {
  credit: 'Credit',
  debit: 'Debit',
  payment: 'Paiement',
  transfer: 'Transfert',
  withdrawal: 'Retrait',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  completed: 'Termine',
  failed: 'Echoue',
  cancelled: 'Annule',
}

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (id) loadTransaction() }, [id])

  const loadTransaction = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await walletService.getTransactionById(id)
      setTransaction(data)
    } catch (err) {
      setError('Transaction introuvable')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ScreenLayout title="Transaction" showBack showBottomNav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  if (error || !transaction) {
    return (
      <ScreenLayout title="Transaction" showBack showBottomNav>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{error || 'Transaction introuvable'}</p>
          <Button variant="outline" onClick={() => navigate('/wallet')}>Retour au wallet</Button>
        </div>
      </ScreenLayout>
    )
  }

  const isCredit = transaction.type === 'credit'

  return (
    <ScreenLayout title="Detail transaction" showBack showBottomNav>
      <div className="transaction-detail">
        <div className={`transaction-type-badge ${transaction.type}`}>
          {typeLabels[transaction.type] || transaction.type}
        </div>

        <p className="transaction-date">
          {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
          {' - '}
          {new Date(transaction.created_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
          })}
        </p>

        <div className={`transaction-amount-large ${isCredit ? 'credit' : 'debit'}`}>
          {isCredit ? '+' : '-'}{Number(transaction.amount).toLocaleString('fr-FR')} {transaction.currency || 'XAF'}
        </div>

        <div className={`transaction-status ${transaction.status}`}>
          <span className="status-dot" />
          <span>{statusLabels[transaction.status] || transaction.status}</span>
        </div>

        <div className="transaction-info">
          <div className="info-item">
            <p className="info-label">ID Transaction</p>
            <p className="info-value">{transaction.id.substring(0, 8).toUpperCase()}</p>
          </div>
          {transaction.description && (
            <div className="info-item">
              <p className="info-label">Description</p>
              <p className="info-value">{transaction.description}</p>
            </div>
          )}
          <div className="info-item">
            <p className="info-label">Type</p>
            <p className="info-value">{typeLabels[transaction.type] || transaction.type}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Statut</p>
            <p className="info-value">{statusLabels[transaction.status] || transaction.status}</p>
          </div>
        </div>

        <div className="receipt-details">
          <h3>Details</h3>
          <div className="receipt-row">
            <span>Montant</span>
            <span>{Number(transaction.amount).toLocaleString('fr-FR')} {transaction.currency || 'XAF'}</span>
          </div>
          <div className="receipt-row total">
            <span>Total</span>
            <span>{Number(transaction.amount).toLocaleString('fr-FR')} {transaction.currency || 'XAF'}</span>
          </div>
        </div>

        <div className="transaction-actions">
          <Button variant="outline" fullWidth onClick={() => navigate('/wallet')}>
            Retour au portefeuille
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default TransactionDetail
