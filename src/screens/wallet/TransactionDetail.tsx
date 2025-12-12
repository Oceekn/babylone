import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { User, Scissors, DollarSign } from 'lucide-react'
import './TransactionDetail.css'

const TransactionDetail = () => {
  return (
    <ScreenLayout title="Transaction Detail" showBack showBottomNav>
      <div className="transaction-detail">
        <div className="transaction-type-badge">Payment</div>
        <p className="transaction-date">24 Jul, 2024 - 10:30 AM</p>
        <div className="transaction-amount-large">-15,000 XAF</div>
        <div className="transaction-status">
          <span className="status-dot"></span>
          <span>Completed</span>
        </div>
        <div className="transaction-info">
          <div className="info-item">
            <p className="info-label">Transaction ID</p>
            <p className="info-value">1234567890</p>
          </div>
          <div className="info-item">
            <User size={20} />
            <div>
              <p className="info-label">Professional</p>
              <p className="info-value">Marie</p>
            </div>
          </div>
          <div className="info-item">
            <Scissors size={20} />
            <div>
              <p className="info-label">Service</p>
              <p className="info-value">Haircut</p>
            </div>
          </div>
        </div>
        <div className="receipt-details">
          <h3>Receipt Details</h3>
          <div className="receipt-row">
            <span>Subtotal</span>
            <span>15,000 XAF</span>
          </div>
          <div className="receipt-row">
            <span>Taxes</span>
            <span>0 XAF</span>
          </div>
          <div className="receipt-row total">
            <span>Total</span>
            <span>15,000 XAF</span>
          </div>
        </div>
        <div className="transaction-actions">
          <Button variant="outline" fullWidth>Download Receipt</Button>
          <Button variant="outline" fullWidth>Report a Problem</Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default TransactionDetail



